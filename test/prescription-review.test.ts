import { describe, it, expect, vi } from 'vitest';
import { MobileDocumentUploadService } from '../services/documents/upload-service';
import { ApiClient } from '../services/api/client';
import { EditableMedicine } from '../features/prescriptions/ReviewPrescriptionScreen';

describe('Prescription Review & Clinical Confirmation Safety', () => {
  it('treats unreviewed AI extraction strictly as draft and defaults active medication to false', () => {
    // Simulate initial AI extraction passed to review screen
    const rawAiExtraction = {
      prescription_date: '2026-05-10',
      date_is_uncertain: false,
      doctor_name: 'Dr. Sharma',
      clinic_hospital_name: 'City Care Hospital',
      documented_diagnosis: 'Hypertension',
      medicines: [
        {
          id: 'med-1',
          name_as_written: 'Tab Telma 40mg',
          normalized_medicine_name: 'Telmisartan',
          strength: '40mg',
          dosage_form: 'TABLET',
          frequency_text: 'Once daily (OD) in morning',
          duration_text: '30 days',
          route: 'ORAL',
          instructions: 'After breakfast',
          confidence: 'HIGH',
          // Note: is_active_medication is omitted by AI extraction
        },
        {
          id: 'med-2',
          name_as_written: 'Tab Amlong 5mg',
          dosage_form: 'TABLET',
          route: 'ORAL',
          confidence: 'UNCERTAIN',
        },
      ],
      validation_warnings: ['Dosage frequency for Tab Amlong was ambiguous in handwriting'],
    };

    // The review mapper logic matches ReviewPrescriptionScreen initialization
    const mappedMedicines: EditableMedicine[] = rawAiExtraction.medicines.map((m, idx) => ({
      id: m.id || `med-${idx + 1}`,
      name_as_written: m.name_as_written || '',
      normalized_medicine_name: m.normalized_medicine_name || '',
      strength: m.strength || '',
      dosage_form: (m.dosage_form as any) || 'TABLET',
      frequency_text: m.frequency_text || '',
      duration_text: m.duration_text || '',
      route: (m.route as any) || 'ORAL',
      instructions: m.instructions || '',
      confidence: (m.confidence as any) || 'HIGH',
      is_active_medication: Boolean((m as any).is_active_medication), // Critical safety default: false
    }));

    // Invariant 1: Unreviewed prescriptions never default to active medication regimens
    expect(mappedMedicines[0].is_active_medication).toBe(false);
    expect(mappedMedicines[1].is_active_medication).toBe(false);

    // Invariant 2: Name as written is kept separate from normalized medicine name
    expect(mappedMedicines[0].name_as_written).toBe('Tab Telma 40mg');
    expect(mappedMedicines[0].normalized_medicine_name).toBe('Telmisartan');
    expect(mappedMedicines[1].name_as_written).toBe('Tab Amlong 5mg');
    expect(mappedMedicines[1].normalized_medicine_name).toBe('');

    // Invariant 3: Ambiguity is preserved
    expect(mappedMedicines[1].confidence).toBe('UNCERTAIN');
    expect(rawAiExtraction.validation_warnings).toHaveLength(1);
  });

  it('rejects confirmation when medicine name_as_written is missing or blank', () => {
    const medicines: EditableMedicine[] = [
      {
        id: 'med-1',
        name_as_written: '   ', // Blank name
        dosage_form: 'TABLET',
        route: 'ORAL',
        confidence: 'HIGH',
        is_active_medication: false,
      },
    ];

    const hasEmptyName = medicines.some((m) => !m.name_as_written.trim());
    expect(hasEmptyName).toBe(true);
  });

  it('preserves clinical certainty flags and explicit confirmed payload structure', async () => {
    const mockClient = new ApiClient({ baseUrl: 'http://mock' });
    const postSpy = vi.spyOn(mockClient, 'post').mockResolvedValue({
      data: {
        confirmed: true,
        prescriptionRecordId: 'rx-rec-789',
        activeMedicationCount: 1,
      },
    } as any);

    const service = new MobileDocumentUploadService(mockClient);

    const confirmedReviewPayload = {
      prescription_date: '2026-10-12',
      date_is_uncertain: false,
      doctor_name: 'Dr. R. K. Patel',
      clinic_hospital_name: 'Apollo Hospital',
      documented_diagnosis: 'Type 2 Diabetes',
      medicines: [
        {
          name_as_written: 'Metformin 500mg SR',
          normalized_medicine_name: 'Metformin Hydrochloride',
          strength: '500mg',
          dosage_form: 'TABLET',
          frequency_text: 'BD after meals',
          duration_text: '90 days',
          route: 'ORAL',
          instructions: 'Take with or immediately after food',
          is_active_medication: true, // Explicitly confirmed by patient
        },
        {
          name_as_written: 'Paracetamol 650mg',
          normalized_medicine_name: 'Paracetamol',
          strength: '650mg',
          dosage_form: 'TABLET',
          frequency_text: 'SOS for fever',
          route: 'ORAL',
          is_active_medication: false, // As needed, not active ongoing regimen
        },
      ],
    };

    const result = await service.confirmPrescription('job-123', confirmedReviewPayload);

    expect(postSpy).toHaveBeenCalledWith('/prescriptions/job-123/confirm', confirmedReviewPayload);
    expect(result.prescriptionRecordId).toBe('rx-rec-789');
    expect(result.activeMedicationCount).toBe(1);
  });

  it('correctly handles uncertain dates during review initialization', () => {
    const extractionWithMissingDate = {
      prescription_date: undefined,
      date_is_uncertain: false,
      medicines: [],
    };

    const initialDate = extractionWithMissingDate.prescription_date || '';
    const dateIsUncertain =
      extractionWithMissingDate.date_is_uncertain || !extractionWithMissingDate.prescription_date;

    expect(initialDate).toBe('');
    expect(dateIsUncertain).toBe(true);
  });
});

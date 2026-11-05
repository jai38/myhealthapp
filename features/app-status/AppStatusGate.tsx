import React from 'react';
import { View } from 'react-native';
import type { AppStatusState } from './useAppStatus';
import { MaintenanceScreen, OptionalUpdateCard, RequiredUpdateScreen } from './AppStatusScreens';

// Wraps the signed-in and signed-out trees. Required update and maintenance replace the
// children entirely, so nothing underneath is reachable. Optional update sits above them.
export function AppStatusGate({
  state,
  children,
}: {
  state: AppStatusState;
  children: React.ReactNode;
}) {
  if (state.decision === 'requiredUpdate') {
    return <RequiredUpdateScreen onUpdate={state.openUpdate} />;
  }
  if (state.decision === 'maintenance') {
    return <MaintenanceScreen message={state.maintenanceMessage} onRetry={state.recheck} />;
  }
  return (
    <View style={{ flex: 1 }}>
      {state.decision === 'optionalUpdate' && (
        <OptionalUpdateCard onUpdate={state.openUpdate} onDismiss={state.dismissOptional} />
      )}
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}

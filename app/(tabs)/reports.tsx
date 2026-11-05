// Old route. Reports now live in the Records tab.
import { Redirect } from 'expo-router';

export default function LegacyReportsRoute() {
  return <Redirect href={{ pathname: '/records', params: { view: 'reports' } }} />;
}

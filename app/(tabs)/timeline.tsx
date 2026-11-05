// Old route. Timeline now lives in the Records tab.
import { Redirect } from 'expo-router';

export default function LegacyTimelineRoute() {
  return <Redirect href={{ pathname: '/records', params: { view: 'timeline' } }} />;
}

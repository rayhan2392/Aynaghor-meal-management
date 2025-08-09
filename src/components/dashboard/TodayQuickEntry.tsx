import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function TodayQuickEntry() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Quick Entry</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-gray-500">
          <p>Quick entry forms for today's meals, expenses, and deposits will be available here.</p>
          <p className="text-sm mt-2">Use the navigation menu to access detailed entry forms.</p>
        </div>
      </CardContent>
    </Card>
  );
}

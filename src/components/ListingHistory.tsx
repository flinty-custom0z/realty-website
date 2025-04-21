import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface HistoryChange {
  before: any;
  after: any;
}

interface HistoryEntry {
  id: string;
  createdAt: string;
  action: 'create' | 'update' | 'delete';
  changes: Record<string, HistoryChange> | { action: string };
  userName: string;
}

interface ListingHistoryProps {
  listingId: string;
}

export default function ListingHistory({ listingId }: ListingHistoryProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/admin/listings/${listingId}/history`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch listing history');
        }
        
        const data = await response.json();
        setHistory(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [listingId]);

  const formatFieldName = (field: string): string => {
    // Map field names to more readable versions
    const fieldMap: Record<string, string> = {
      title: 'Title',
      publicDescription: 'Public Description',
      adminComment: 'Admin Comment',
      categoryId: 'Category',
      district: 'District',
      address: 'Address',
      rooms: 'Rooms',
      floor: 'Floor',
      totalFloors: 'Total Floors',
      houseArea: 'House Area',
      landArea: 'Land Area',
      condition: 'Condition',
      yearBuilt: 'Year Built',
      noEncumbrances: 'No Encumbrances',
      noKids: 'No Kids',
      price: 'Price',
      status: 'Status',
      userId: 'Agent'
    };

    return fieldMap[field] || field;
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading history...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  if (history.length === 0) {
    return <div className="p-4 text-gray-500">No history available for this listing.</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold mb-4">Listing History</h3>
      
      <div className="space-y-4">
        {history.map((entry) => (
          <div key={entry.id} className="border-b pb-4">
            <div className="flex justify-between mb-2">
              <div>
                <span className="font-medium">{entry.userName}</span> 
                <span className="ml-2 text-gray-600">
                  {entry.action === 'create' 
                    ? 'created this listing' 
                    : entry.action === 'update' 
                      ? 'updated this listing'
                      : 'deleted this listing'}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
              </div>
            </div>

            {entry.action === 'create' && 'action' in entry.changes && (
              <div className="text-sm text-gray-600 ml-2">
                {entry.changes.action as string}
              </div>
            )}

            {entry.action === 'update' && (
              <div className="mt-2 space-y-2">
                {Object.entries(entry.changes as Record<string, HistoryChange>).map(([field, change]) => (
                  <div key={field} className="grid grid-cols-3 text-sm">
                    <div className="font-medium">{formatFieldName(field)}</div>
                    <div className="text-red-500 line-through">
                      {change.before === null ? 'Empty' : 
                       typeof change.before === 'boolean' ? (change.before ? 'Yes' : 'No') : 
                       change.before}
                    </div>
                    <div className="text-green-500">
                      {change.after === null ? 'Empty' : 
                       typeof change.after === 'boolean' ? (change.after ? 'Yes' : 'No') : 
                       change.after}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {entry.action === 'delete' && 'action' in entry.changes && (
              <div className="text-sm text-gray-600 ml-2">
                Listing was deleted: {(entry.changes as any).title || 'Unknown listing'}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 
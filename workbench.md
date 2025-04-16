## Advanced sort for later

```
// Determine sort order
  const validSortFields = ['price', 'dateAdded', 'title', 'yearBuilt', 'houseArea', 'landArea', 'rooms', 'floor', 'totalFloors'] as const;
  type SortField = typeof validSortFields[number];

  function isSortField(value: string): value is SortField {
    return validSortFields.includes(value as SortField);
  }

  const sortParam = searchParams.sort;
  const sortField: SortField = typeof sortParam === 'string' && isSortField(sortParam) ? sortParam : 'dateAdded';

  const sortOrder = searchParams.order || 'desc';
```


## Backlog

- Admin login not working when accessing website via IP address (but working via localhost)


## Next


- Better image slider:
  - Dynamic resizing/remove gray borders
  - Click not working on other pics
- Change name
- Remove "Детали" link on details page
- Admin comments
- Link to admin pannel/login
- Buttons for admins on every listing
- Implement search
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

- Change name to "Вторичный Выбор" 
- Details Page
  - When I click on delete in details it should go back to the appropriate list, not to admin listings panel
- Link to admin pannel/login somewhere on every page
- Implement search, right now it's not working
- Button to reset filter
- Edit "Риелтор" - contact details


## Later

- Edit history

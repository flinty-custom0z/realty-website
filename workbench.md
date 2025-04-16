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



## Next

- Link to admin pannel/login somewhere on every page and it should be visible that you're logged in as admin and it should let you log out (button)
- Implement search, right now it's not working
- Button to reset filter
- Edit "Риелтор" - contact details - add a contact details property and let them choose one of the people, let admin edit the list of people


## Later

- Admin login not working when accessing website via IP address (but working via localhost)
- Edit history

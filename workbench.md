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

- Change name
- Details Page
  - Remove "Детали" link on details page (prob. need to rename to something like "назад к списку")
  - Make image smaller
  - Buttons for admins on every listing (edit, delete)
  - Комментарий админ-ра должен быть показан на детальных страницах тоже if you're logged in as an admin
- Link to admin pannel/login
- Implement search
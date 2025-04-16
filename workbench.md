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

- Edit "Риелтор" - contact details - add a contact details property and let them choose one of the people, let admin edit the list of people
- Dynamic suggestions when entering search query

- Button to go back when you're done with searching (not sure how it's usually called/implemented)
- Filter applied automatically when selecting
- Multiselect in filter (eg 1 and 2 rooms)
- Choosing district from avaliable
- When searching across mult. categories show on each result what category it belongs to


- Reset search query after refreshing the webpage

## Later

- Admin login not working when accessing website via IP address (but working via localhost)
- Edit history

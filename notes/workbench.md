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



## NOW

- When you press "Сбросить фильтры" while searching it shouldn't remove the search query

- When opening details from search the search query in field should remain bc you may go back to the search results
- Filters still incorrectly show other categories to select when doing a global search, it should be limited to avaliable categories just like with other filters
- Cannot enter anything in second search field (the one in filters block), looks like it's getting erased right away
- When I select and unselect a filter the results won't reset it still shows only filtered listings until I select "применить"


## Next

- Fix sorting, currently it's doing anything
- Dynamic suggestions when entering search query
- Edit "Риелтор" - contact details - add a contact details property and let them choose one of the people, let admin edit the list of people

- Status for listing? (active/not active)
- 
## Later
- On main after categories it should show all listings and user should be able to choose what to sort by
- Edit history
- Admin login not working when accessing website via IP address (but working via localhost)

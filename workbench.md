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

- Don't need multiple search fields (second one in filters block), change to just automatically select a fitting category when search from a category page.

- When in a category or when selected a category, list of districts in filter should adjust automatically, so that user is only able to select districts where there are avaliable listings. Same with "состояние", "комнаты", price etc. 

- From search results it should go back to category tho if the search was started from a category and not from the main page (Dynamic <- Назад к {категории}/Назад на главную depending on where the search was started)
- Filter applied automatically when selecting

## Next

- Fix sorting, currently it's doing anything
- Dynamic suggestions when entering search query
- Edit "Риелтор" - contact details - add a contact details property and let them choose one of the people, let admin edit the list of people


## Later
- On main after categories it should show all listings and user should be able to choose what to sort by
- Edit history
- Admin login not working when accessing website via IP address (but working via localhost)
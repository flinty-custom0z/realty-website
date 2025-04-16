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

- Multiselect in filter for everything that can be multi selected: categories (when general search), "район" and "состояние" when in one of the categories

- Choosing district from avaliable: when in category should once show categories that are avaliable for this type of listing
- Button to go back when you're done with searching: when searching in category this button should go back to category not to main
- Clear search query when going to some other page (category/main page - navigation from header)

- Remove two search bars in search results
- Go back to search results when opening a listing from a search
- Add another search field in "Фильтры" when you're in a category - it should filter/search only from listings in the currect category

- Fix: When in search selecting a filter it resets to a general `/search` 

- On main after categories it should show all listings and user should be able to choose what to sort by

## Next

- Filter applied automatically when selecting
- Dynamic suggestions when entering search query
- Edit "Риелтор" - contact details - add a contact details property and let them choose one of the people, let admin edit the list of people


## Later

- Edit history
- Admin login not working when accessing website via IP address (but working via localhost)
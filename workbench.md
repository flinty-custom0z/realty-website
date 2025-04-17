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
- There's still no button to go back when searching
    - From search results it should go back to category tho if the search was started from a category and not from the main page (Dynamic <- Назад к {категории}/Назад на главную depending on where the search was started)
- When using filter in a category it shows listings from other categories
    - Filters incorrectly show other categories, districts etc. when you search from a category. It works when you just open a category (meaning it automatically limits the options to such that exist in listings in the category) but doesn't do the same when searching




- Change second search field the one that is filters block to "Поиск ко категории" and modify it so that it only searches in the current category. Also remove "<- На главную" below it.
- "<- На главную" is showing twice now when searching keep the second one
- Add reset filter functionality
- Also when doing global search hide the second search field - it should be only for when browsing a category

- Search entry from the field needs to be cleared when going to another category. Now it only clears when you go home

- When I turn on and off a few filters it glitches until I manually unset them and press "Применить фильтры"
- Filters are also applying inconsistently. Eg when I select number of rooms it doesn't do anything but if i click the same number again it filters and changes the url accordingly



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

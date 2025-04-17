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


### NOW

- Now it asks me to change the price when switching between different filters when it should actually do it automatically.  (see screenshots)
- Сбросить фильтры should clear the local search
- When I search in a category and press go back - local search query should be cleared - but now it remains
- Filters options are not changed dynamically when there are fewer options bc of one filter
  - Same as before: I need to change other filter fields dynamically. Eg when I select "состояние" and there are fewer listings - "районы", price, rooms and other things/filters should reflect the change and only show from options that fit the remaining listings (see screenshot)
  - They work in global search sometimes but not in categories
- Filters are sometimes applied dynamically, sometimes I need to manually press apply


### Next

- The main image should be the first to show up when opening details, now they're not the same

- Fix sorting, currently it's doing anything
- Dynamic suggestions when entering search query
- Edit "Риелтор" - contact details - add a contact details property and let them choose one of the people, let admin edit the list of people

- Status for listing? (active/not active)


- Add a slider to filter price as well

### Later

- On main after categories it should show all listings and user should be able to choose what to sort by
- Edit history
- Admin login not working when accessing website via IP address (but working via localhost)

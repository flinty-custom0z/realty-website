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

Here are the errors I need you to help me fix: 

```

- When I just open a category filters should only show options limited to avaliable listings in that category. Now when I just open a category I see grayed out options, but they only should be there for when one or more filters are applied

- Problem with prices is not fixed. They still won't update in categories when applying filters. They only update when I enter something in a local search field

In global search when I select and apply a filter then unselect, reset option disappears but results stay filtered

- When I enter a price manually e.g. from 1k till 4.5M (but there's a listing for 192) - it resets the price when applying another filter, but it shouldn't. It also won't show the other listings until I press apply twice, even tho the price resets right away.
```

Please read the code, check the attached project and help me fix it. Return the full fixed version for every file I need to fix. Don't be cheap and read as much as you can. It's very important.




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

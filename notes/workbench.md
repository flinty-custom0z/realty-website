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

```

Please read the code, check the attached project and help me fix it. Return the full fixed version for every file I need to fix. Don't be cheap and read as much as you can. It's very important.




- When opening a category and selecting/applying a filter the price ranges won't update. It only updates when I enter something in the local search field. I need it to adjust based on avaliable listings unless user manually entered the min/max price

- Local search query is copied to global one, when it shouldn't be. They should be independant


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

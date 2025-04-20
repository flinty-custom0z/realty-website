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


- Edit "Риелтор" - contact details - add a contact details property and let them choose one of the people, let admin edit the list of people

- Add a pic to realtor

- Redirect after logout


### Next

- Dynamic suggestions when entering search query


- Status for listing? (active/not active)

- Add a slider to filter price as well

### Later

- On main after categories it should show all listings and user should be able to choose what to sort by
- Edit history
- Admin login not working when accessing website via IP address (but working via localhost)

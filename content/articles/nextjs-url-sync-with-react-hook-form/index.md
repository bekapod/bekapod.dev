---
date: 2023-02-25T23:07:00Z
description: 'A quick React hook for syncing React Hook Form with Next.js URL query parameters.'
draft: false
images: []
lastmod: 2023-02-26T15:25:00Z
publishDate: 2023-02-25T23:07:00Z
series: []
slug: ''
summary: 'A quick React hook for syncing React Hook Form with Next.js URL query parameters.'
title: 'React Hook Form & Next.js URL Sync'
---

If you're building a search page with Next.js and React Hook Form, you may want
to sync the form values with the URL query parameters. This way, users can share
the search results with others or bookmark the page.

This hook will sync any form value changes with the URL query parameters and
allow you to use the URL query parameters as your source of truth for fetching data.

It will also sync any changes to the URL query parameters with the form values.
For example, the back and forward browser buttons will work as expected.

## Dependencies

- [React](https://reactjs.org)
- [React Hook Form](https://react-hook-form.com)
- [Next.js](https://nextjs.org)
- [lodash/isEqual](https://lodash.com/docs/4.17.15#isEqual) - or any other deep
  equality check function
- [qs](https://www.npmjs.com/package/qs)

## The Hook

```js
import isEqual from 'lodash/isEqual'
import { useRouter } from 'next/router'
import qs from 'qs'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

export const useSearchForm = () => {
  const { query, push, beforePopState } = useRouter()
  const methods = useForm({
    defaultValues: query,
  })
  const { watch, reset } = methods
  const values = watch()

  useEffect(() => {
    // this is useful if you have any parameters, e.g. pagination that are
    // controlled via links and not a search form
    const ignoreParams = ['skip']

    const newQuery = Object.fromEntries(
      Object.entries(values)
        // remove any ignored params
        .filter(([key]) => !ignoreParams.includes(key))
        // remove any empty values from the query as they're
        // not needed in the URL
        .filter(([, value]) =>
          Array.isArray(value) ? value.length > 0 : value
        )
        // when an array value only has one item, it won't
        // be an array in the router query, so we need to
        // convert it back to a single value so it can be
        // compared correctly
        .map(([key, value]) => {
          if (
            !Array.isArray(query[key]) &&
            Array.isArray(value) &&
            value.length === 1
          ) {
            return [key, value.at(0)]
          }

          return [key, value]
        })
    )

    // if query without ignored params is equal to newQuery,
    // then we don't need to push the new query to the history
    const queryWithoutIgnoredParams = Object.fromEntries(
      Object.entries(query).filter(([key]) => !ignoreParams.includes(key))
    )
    if (!isEqual(queryWithoutIgnoredParams, newQuery)) {
      void push({ query: newQuery }, undefined, {
        shallow: true,
      })
    }
  }, [values, query, push])

  useEffect(() => {
    // back button handling, to avoid getting into a loop where
    // react-hook-form and the url are not perfectly in sync,
    // we reset the form to the previous state. When the url
    // is updated, the form already reflects the "new" state.
    beforePopState(({ url }) => {
      const base = document.location.protocol + '//' + document.location.host
      const query = new URL(base + url).searchParams.toString()
      reset(qs.parse(query))
      return true
    })
  }, [beforePopState, reset])

  return [query, methods]
}
```

import {
  ApolloClient,
  InMemoryCache,
  ApolloLink,
  HttpLink,
} from '@apollo/client'
import { onError } from '@apollo/client/link/error'
import { useMemo } from 'react'

const { GRAPHQL_BASE_URL } = process.env

export const initializeApollo = (token: string) => {
  return new ApolloClient({
    link: ApolloLink.from([
      onError(({ graphQLErrors, networkError, forward, operation }) => {
        if (graphQLErrors) {
          graphQLErrors.forEach((error) => {
            const { message, locations, path } = error
            console.warn(
              `[GraphQL error]: Message: ${message}, Path: ${JSON.stringify(
                path,
              )}`,
              locations,
            )
          })
        }
        if (networkError) {
          console.warn(`[Network error]: ${JSON.stringify(networkError)}`)
        }
        return forward(operation)
      }),
      new HttpLink({
        uri: GRAPHQL_BASE_URL + '/graphql',
        headers: {
          authorization: token ? `Bearer ${token}` : ''
        }
      }),
    ]),
    cache: new InMemoryCache(),
  })
}

export const useApollo = (token: string) => {
  const apollo = useMemo(() => initializeApollo(token), [token])
  return apollo
}

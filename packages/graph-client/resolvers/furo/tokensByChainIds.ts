import { FURO_SUBGRAPH_NAME, SUBGRAPH_HOST } from '@sushiswap/graph-config'
import { isPromiseFulfilled } from '@sushiswap/validate'
import { GraphQLResolveInfo } from 'graphql'

import { Query, QueryfuroTokensByChainIdsArgs, QueryResolvers, RequireFields } from '../../.graphclient'
import { FuroStreamTypes } from '../../.graphclient/sources/FuroStream/types'

export const _furoTokensByChainIds = async (
  root = {},
  args: RequireFields<QueryfuroTokensByChainIdsArgs, 'chainIds'>,
  context: FuroStreamTypes.Context,
  info: GraphQLResolveInfo
): Promise<Query['furoTokensByChainIds']> => {
  return Promise.allSettled<Query['furoTokensByChainIds'][]>(
    args.chainIds
      .filter((chainId) => {
        return chainId in FURO_SUBGRAPH_NAME
      })
      .map((chainId) => {
        return context.FuroStream.Query.tokens({
          root,
          args,
          context: {
            ...context,
            chainId,
            subgraphName: FURO_SUBGRAPH_NAME[chainId],
            subgraphHost: SUBGRAPH_HOST[chainId],
          },
          info,
        }).then((tokens: FuroStreamTypes.Token[]) => {
          if (!Array.isArray(tokens)) {
            console.error(`Furo tokens query failed on ${chainId}`, tokens)
            return []
          }
          return tokens.map((token) => ({ ...token, chainId }))
        })
      })
  ).then((promiseSettledResults) =>
    promiseSettledResults
      .flat()
      .filter(isPromiseFulfilled)
      .flatMap((promiseFulfilled) => promiseFulfilled.value)
  )
}

export const furoTokensByChainIds: QueryResolvers['furoTokensByChainIds'] = async (
  root,
  args,
  context,
  info
): Promise<Query['furoTokensByChainIds']> => _furoTokensByChainIds(root, args, context, info)

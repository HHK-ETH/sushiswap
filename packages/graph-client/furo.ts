import { ChainId } from '@sushiswap/chain'
import { getBuiltGraphSDK } from './dist/.graphclient'
import { FURO_SUBGRAPH_NAME } from '@sushiswap/graph-config'
;(async () => {
  const sdk = getBuiltGraphSDK()

  const chainIds = Object.keys(FURO_SUBGRAPH_NAME).map((key) => Number(key))
  const { tokens } = await sdk.furoTokensByChainIds({ chainIds, where: { liquidityShares_gt: 0 } })
  console.log({ tokens })
})()

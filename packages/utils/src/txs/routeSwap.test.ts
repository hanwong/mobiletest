/* eslint-disable no-lone-blocks */
import type { Chain } from "@initia/initia-registry-types"
import { RouteSwap } from "./routeSwap"
import { denomToMetadata, getIBCDenom } from "../initia"
import type { SwapPair } from "./swap"
import { Tx } from "./tx"
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx"
import { bcs } from "@initia/initia.js"
import type { MsgTransfer } from "cosmjs-types/ibc/applications/transfer/v1/tx"

const initia: Chain = {
  chain_name: "initia",
  chain_id: "initia-1",
  bech32_prefix: "init",
  metadata: {
    is_l1: true,
    ibc_channels: [
      {
        chain_id: "minitia-1",
        port_id: "transfer",
        channel_id: "channel-1",
        version: "ics20-1",
      },
      {
        chain_id: "minitia-2",
        port_id: "transfer",
        channel_id: "channel-2",
        version: "ics20-1",
      },
    ],
  },
}

const minitia1: Chain = {
  chain_name: "minitia1",
  chain_id: "minitia-1",
  bech32_prefix: "init",
  metadata: {
    op_bridge_id: "1",
    op_denoms: ["uinit"],
    ibc_channels: [
      {
        chain_id: "initia-1",
        port_id: "transfer",
        channel_id: "channel-0",
        version: "ics20-1",
      },
    ],
  },
}

const minitia2: Chain = {
  chain_name: "minitia2",
  chain_id: "minitia-2",
  bech32_prefix: "init",
  metadata: {
    op_bridge_id: "2",
    op_denoms: ["uinit"],
    ibc_channels: [
      {
        chain_id: "initia-1",
        port_id: "transfer",
        channel_id: "channel-0",
        version: "ics20-1",
      },
    ],
  },
}

const pairs = new Map<string, SwapPair>([
  [
    "0x1001",
    [
      { denom: "Token1", metadata: denomToMetadata("Token1"), decimals: 6 },
      { denom: "uinit", metadata: denomToMetadata("uinit"), decimals: 6 },
    ],
  ],
  [
    "0x1002",
    [
      { denom: "Token2", metadata: denomToMetadata("Token2"), decimals: 6 },
      { denom: "uinit", metadata: denomToMetadata("uinit"), decimals: 6 },
    ],
  ],
])

const address = "init1h2qgaqzvk2rz03p9hualp3shsfnj76u9upsp4u"

const minitia1Pair = {
  "l2/1000": "uinit",
  "ibc/1001": "Token1",
  "ibc/1002": "Token2",
}

const minitia2Pair = {
  "l2/2000": "uinit",
  "ibc/2001": "Token1",
  "ibc/2002": "Token2",
}

const txParamsL1 = {
  address,
  layer1: initia,
  layer: initia,
  modules: {
    dex_utils: address,
    swap_transfer: address,
  },
  pairs: {},
}

const l1Tx = new Tx(txParamsL1)

const txParamsL2 = {
  address,
  layer1: initia,
  layer: minitia1,
  modules: {
    dex_utils: address,
    swap_transfer: address,
  },
  pairs: minitia1Pair,
}

const l2Tx = new Tx(txParamsL2)

const recipientAddress = "init1ng0l67e23ej7yhkts24nj5kyk6av60s8j5c8tx"

describe("routeSwap", () => {
  test("get_routes_test", () => {
    // sends
    // case 1 send L1 => L1
    {
      const params = {
        offerDenom: "uinit",
        askDenom: "uinit",
        swaplist: pairs,
        targetLayer: initia,
      }
      const routeSwap = new RouteSwap(l1Tx, params)
      expect(routeSwap.getRoutes()).toEqual({
        offerMetadata: denomToMetadata("uinit"),
        routeArgs: [],
      })
    }

    // case 2 send L1 => L2
    {
      const params = {
        offerDenom: "uinit",
        askDenom: "l2/1000",
        swaplist: pairs,
        targetLayer: minitia1,
        targetLayerPairs: minitia1Pair,
      }
      const routeSwap = new RouteSwap(l1Tx, params)
      expect(routeSwap.getRoutes()).toEqual({
        offerMetadata: denomToMetadata("uinit"),
        routeArgs: [],
      })
    }

    // case 3 send L2 => L1 op bridged token
    {
      const params = {
        offerDenom: "l2/1000",
        askDenom: "uinit",
        swaplist: pairs,
        targetLayer: initia,
      }
      const routeSwap = new RouteSwap(l2Tx, params)
      expect(routeSwap.getRoutes()).toEqual({
        offerMetadata: denomToMetadata(getIBCDenom("channel-1", params.offerDenom)),
        routeArgs: [[bcs.u8().serialize(1).toBytes(), bcs.object().serialize(denomToMetadata("uinit")).toBytes()]],
      })
    }

    // case 4 send L2 => L1 non op bridged token
    {
      const params = {
        offerDenom: "ibc/1001",
        askDenom: "Token1",
        swaplist: pairs,
        targetLayer: initia,
      }
      const routeSwap = new RouteSwap(l2Tx, params)
      expect(routeSwap.getRoutes()).toEqual({
        offerMetadata: denomToMetadata("Token1"),
        routeArgs: [],
      })
    }

    // case 5 send L2 => L2 op bridged token
    {
      const params = {
        offerDenom: "l2/1000",
        askDenom: "l2/2000",
        swaplist: pairs,
        targetLayer: minitia2,
        targetLayerPairs: minitia2Pair,
      }
      const routeSwap = new RouteSwap(l2Tx, params)
      expect(routeSwap.getRoutes()).toEqual({
        offerMetadata: denomToMetadata(getIBCDenom("channel-1", params.offerDenom)),
        routeArgs: [[bcs.u8().serialize(1).toBytes(), bcs.object().serialize(denomToMetadata("uinit")).toBytes()]],
      })
    }

    // case 6 send L2 => L2 non op bridged token
    {
      const params = {
        offerDenom: "ibc/1001",
        askDenom: "ibc/2001",
        swaplist: pairs,
        targetLayer: minitia2,
        targetLayerPairs: minitia2Pair,
      }
      const routeSwap = new RouteSwap(l2Tx, params)
      expect(routeSwap.getRoutes()).toEqual({
        offerMetadata: denomToMetadata("Token1"),
        routeArgs: [],
      })
    }

    // case 7 send L2 => L2 in same layer
    {
      const params = {
        offerDenom: "l2/1000",
        askDenom: "l2/1000",
        swaplist: pairs,
        targetLayer: minitia1,
        targetLayerPairs: minitia1Pair,
      }
      const routeSwap = new RouteSwap(l2Tx, params)
      expect(routeSwap.getRoutes()).toEqual({
        offerMetadata: denomToMetadata("uinit"),
        routeArgs: [],
      })
    }

    // swap
    // case 1 swap L1 => L1
    {
      const params = {
        offerDenom: "uinit",
        askDenom: "Token1",
        swaplist: pairs,
        targetLayer: initia,
      }
      const routeSwap = new RouteSwap(l1Tx, params)
      expect(routeSwap.getRoutes()).toEqual({
        offerMetadata: denomToMetadata("uinit"),
        routeArgs: [[bcs.u8().serialize(0).toBytes(), bcs.object().serialize("0x1001").toBytes()]],
      })
    }

    // case 2 swap L1 => L2
    {
      const params = {
        offerDenom: "uinit",
        askDenom: "ibc/1001",
        swaplist: pairs,
        targetLayer: minitia1,
        targetLayerPairs: minitia1Pair,
      }
      const routeSwap = new RouteSwap(l1Tx, params)
      expect(routeSwap.getRoutes()).toEqual({
        offerMetadata: denomToMetadata("uinit"),
        routeArgs: [[bcs.u8().serialize(0).toBytes(), bcs.object().serialize("0x1001").toBytes()]],
      })
    }

    // case 3 swap L2 => L1 op bridged token
    {
      const params = {
        offerDenom: "l2/1000",
        askDenom: "Token1",
        swaplist: pairs,
        targetLayer: initia,
      }
      const routeSwap = new RouteSwap(l2Tx, params)
      expect(routeSwap.getRoutes()).toEqual({
        offerMetadata: denomToMetadata(getIBCDenom("channel-1", params.offerDenom)),
        routeArgs: [
          [bcs.u8().serialize(1).toBytes(), bcs.object().serialize(denomToMetadata("uinit")).toBytes()],
          [bcs.u8().serialize(0).toBytes(), bcs.object().serialize("0x1001").toBytes()],
        ],
      })
    }

    // case 4 swap L2 => L1 non op bridged token
    {
      const params = {
        offerDenom: "ibc/1001",
        askDenom: "uinit",
        swaplist: pairs,
        targetLayer: initia,
      }
      const routeSwap = new RouteSwap(l2Tx, params)
      expect(routeSwap.getRoutes()).toEqual({
        offerMetadata: denomToMetadata("Token1"),
        routeArgs: [[bcs.u8().serialize(0).toBytes(), bcs.object().serialize("0x1001").toBytes()]],
      })
    }

    // case 5 swap L2 => L2 op bridged token
    {
      const params = {
        offerDenom: "l2/1000",
        askDenom: "ibc/2001",
        swaplist: pairs,
        targetLayer: minitia2,
        targetLayerPairs: minitia2Pair,
      }
      const routeSwap = new RouteSwap(l2Tx, params)
      expect(routeSwap.getRoutes()).toEqual({
        offerMetadata: denomToMetadata(getIBCDenom("channel-1", params.offerDenom)),
        routeArgs: [
          [bcs.u8().serialize(1).toBytes(), bcs.object().serialize(denomToMetadata("uinit")).toBytes()],
          [bcs.u8().serialize(0).toBytes(), bcs.object().serialize("0x1001").toBytes()],
        ],
      })
    }

    // case 6 swap L2 => L2 non op bridged token
    {
      const params = {
        offerDenom: "ibc/1001",
        askDenom: "l2/2000",
        swaplist: pairs,
        targetLayer: minitia2,
        targetLayerPairs: minitia2Pair,
      }
      const routeSwap = new RouteSwap(l2Tx, params)
      expect(routeSwap.getRoutes()).toEqual({
        offerMetadata: denomToMetadata("Token1"),
        routeArgs: [[bcs.u8().serialize(0).toBytes(), bcs.object().serialize("0x1001").toBytes()]],
      })
    }

    // route swap
    // case 1 L1 => L1
    {
      const params = {
        offerDenom: "Token1",
        askDenom: "Token2",
        swaplist: pairs,
        targetLayer: initia,
      }
      const routeSwap = new RouteSwap(l1Tx, params)
      expect(routeSwap.getRoutes()).toEqual({
        offerMetadata: denomToMetadata("Token1"),
        routeArgs: [
          [bcs.u8().serialize(0).toBytes(), bcs.object().serialize("0x1001").toBytes()],
          [bcs.u8().serialize(0).toBytes(), bcs.object().serialize("0x1002").toBytes()],
        ],
      })
    }

    // case 2 L1 => L2
    {
      const params = {
        offerDenom: "Token1",
        askDenom: "ibc/1002",
        swaplist: pairs,
        targetLayer: minitia1,
        targetLayerPairs: minitia1Pair,
      }
      const routeSwap = new RouteSwap(l1Tx, params)
      expect(routeSwap.getRoutes()).toEqual({
        offerMetadata: denomToMetadata("Token1"),
        routeArgs: [
          [bcs.u8().serialize(0).toBytes(), bcs.object().serialize("0x1001").toBytes()],
          [bcs.u8().serialize(0).toBytes(), bcs.object().serialize("0x1002").toBytes()],
        ],
      })
    }

    // case 3 L2 => L1
    {
      const params = {
        offerDenom: "ibc/1001",
        askDenom: "Token2",
        swaplist: pairs,
        targetLayer: initia,
      }
      const routeSwap = new RouteSwap(l2Tx, params)
      expect(routeSwap.getRoutes()).toEqual({
        offerMetadata: denomToMetadata("Token1"),
        routeArgs: [
          [bcs.u8().serialize(0).toBytes(), bcs.object().serialize("0x1001").toBytes()],
          [bcs.u8().serialize(0).toBytes(), bcs.object().serialize("0x1002").toBytes()],
        ],
      })
    }

    // case 3 L2 => L2
    {
      const params = {
        offerDenom: "ibc/1001",
        askDenom: "ibc/2002",
        swaplist: pairs,
        targetLayer: minitia2,
        targetLayerPairs: minitia2Pair,
      }
      const routeSwap = new RouteSwap(l2Tx, params)
      expect(routeSwap.getRoutes()).toEqual({
        offerMetadata: denomToMetadata("Token1"),
        routeArgs: [
          [bcs.u8().serialize(0).toBytes(), bcs.object().serialize("0x1001").toBytes()],
          [bcs.u8().serialize(0).toBytes(), bcs.object().serialize("0x1002").toBytes()],
        ],
      })
    }
  })

  test("get_msg_test", () => {
    // case1 send in same layer
    {
      const params = {
        offerDenom: "uinit",
        askDenom: "uinit",
        swaplist: pairs,
        targetLayer: initia,
      }
      const routeSwap = new RouteSwap(l1Tx, params)
      const amount = "1000"
      expect(routeSwap.getMessages({ amount, recipientAddress })).toEqual([
        {
          typeUrl: "/cosmos.bank.v1beta1.MsgSend",
          value: MsgSend.fromPartial({
            fromAddress: address,
            toAddress: recipientAddress,
            amount: [{ denom: "uinit", amount }],
          }),
        },
      ])
    }

    // case2 L1 swap to
    {
      const params = {
        offerDenom: "uinit",
        askDenom: "Token1",
        swaplist: pairs,
        targetLayer: initia,
      }
      const routeSwap = new RouteSwap(l1Tx, params)
      const amount = "1000"
      const [msg] = routeSwap.getMessages({ amount, recipientAddress })
      const { typeUrl, value } = msg as any
      expect(typeUrl).toEqual("/initia.move.v1.MsgExecute")
      expect(value?.functionName).toEqual("mixed_route_swap_to")
      expect(value?.args[4]).toEqual(bcs.address().serialize(recipientAddress).toBytes())
    }

    // case3 L1 swap transfer
    {
      const params = {
        offerDenom: "uinit",
        askDenom: "ibc/1001",
        swaplist: pairs,
        targetLayer: minitia1,
        targetLayerPairs: minitia1Pair,
      }
      const routeSwap = new RouteSwap(l1Tx, params)
      const amount = "1000"
      const [msg] = routeSwap.getMessages({ amount, recipientAddress })
      const { typeUrl, value } = msg as any
      expect(typeUrl).toEqual("/initia.move.v1.MsgExecute")
      expect(value?.functionName).toEqual("mixed_route_swap_transfer")
      expect(value?.args[4]).toEqual(bcs.string().serialize(recipientAddress).toBytes())
      expect(value?.args[5]).toEqual(bcs.string().serialize("transfer").toBytes())
      expect(value?.args[6]).toEqual(bcs.string().serialize("channel-1").toBytes())
      expect(value?.args[7]).toEqual(bcs.string().serialize("").toBytes())
    }

    // case4 L1 swap deposit
    {
      const params = {
        offerDenom: "Token1",
        askDenom: "l2/1000",
        swaplist: pairs,
        targetLayer: minitia1,
        targetLayerPairs: minitia1Pair,
      }
      const routeSwap = new RouteSwap(l1Tx, params)
      const amount = "1000"
      const [msg] = routeSwap.getMessages({ amount, recipientAddress })
      const { typeUrl, value } = msg as any
      expect(typeUrl).toEqual("/initia.move.v1.MsgExecute")
      expect(value?.functionName).toEqual("mixed_route_swap_deposit")
      expect(value?.args[4]).toEqual(bcs.u64().serialize(1).toBytes())
      expect(value?.args[5]).toEqual(bcs.address().serialize(recipientAddress).toBytes())
      expect(value?.args[6]).toEqual(bcs.vector(bcs.u8()).serialize([]).toBytes())
    }

    // case5 L2 swap to
    {
      const params = {
        offerDenom: "ibc/1001",
        askDenom: "uinit",
        swaplist: pairs,
        targetLayer: initia,
      }
      const routeSwap = new RouteSwap(l2Tx, params)
      const amount = "1000"
      const [msg] = routeSwap.getMessages({ amount, recipientAddress })
      const { typeUrl, value } = msg as any
      expect(typeUrl).toEqual("/ibc.applications.transfer.v1.MsgTransfer")
      expect(value?.sourceChannel).toEqual("channel-0")
      expect(value?.receiver).toEqual(`${address}::swap_transfer::mixed_route_swap_to`)
      expect(JSON.parse(value?.memo)?.move?.message?.function_name).toEqual("mixed_route_swap_to")
    }

    // case6 L2 swap transfer
    {
      const params = {
        offerDenom: "ibc/1001",
        askDenom: "ibc/2002",
        swaplist: pairs,
        targetLayer: minitia2,
        targetLayerPairs: minitia2Pair,
      }
      const routeSwap = new RouteSwap(l2Tx, params)
      const amount = "1000"
      const [msg] = routeSwap.getMessages({ amount, recipientAddress })
      const { typeUrl, value } = msg as any
      expect(typeUrl).toEqual("/ibc.applications.transfer.v1.MsgTransfer")
      expect(value?.sourceChannel).toEqual("channel-0")
      expect(value?.receiver).toEqual(`${address}::swap_transfer::mixed_route_swap_transfer`)
      expect(JSON.parse(value?.memo)?.move?.message?.function_name).toEqual("mixed_route_swap_transfer")
    }

    // case7 L2 swap deposit
    {
      const params = {
        offerDenom: "ibc/1001",
        askDenom: "l2/2000",
        swaplist: pairs,
        targetLayer: minitia2,
        targetLayerPairs: minitia2Pair,
      }
      const routeSwap = new RouteSwap(l2Tx, params)
      const amount = "1000"
      const [msg] = routeSwap.getMessages({ amount, recipientAddress })
      const { typeUrl, value } = msg as any
      expect(typeUrl).toEqual("/ibc.applications.transfer.v1.MsgTransfer")
      expect(value?.sourceChannel).toEqual("channel-0")
      expect(value?.receiver).toEqual(`${address}::swap_transfer::mixed_route_swap_deposit`)
      expect(JSON.parse(value?.memo)?.move?.message?.function_name).toEqual("mixed_route_swap_deposit")
    }
  })

  // full example
  test("source_l2_target_l2_route_swap_transfer_op_bridged_token", () => {
    const params = {
      offerDenom: "l2/1000",
      askDenom: "ibc/2001",
      swaplist: pairs,
      targetLayer: minitia2,
      targetLayerPairs: minitia2Pair,
    }

    const routeSwap = new RouteSwap(l2Tx, params)
    const [msg] = routeSwap.getMessages({ amount: "1000", recipientAddress })
    const { typeUrl, value } = msg as { typeUrl: string; value: MsgTransfer }
    expect(typeUrl).toEqual("/ibc.applications.transfer.v1.MsgTransfer")
    expect(value.sender).toEqual(address)
    expect(value.sourcePort).toEqual("transfer")
    expect(value.sourceChannel).toEqual("channel-0")
    expect(value.token).toEqual({ denom: params.offerDenom, amount: "1000" })
    expect(value.receiver).toEqual(`${address}::swap_transfer::mixed_route_swap_transfer`)
    expect(value.memo).toEqual(
      JSON.stringify({
        move: {
          message: {
            module_address: address,
            module_name: "swap_transfer",
            function_name: "mixed_route_swap_transfer",
            type_args: [],
            args: [
              bcs
                .address()
                .serialize(denomToMetadata(getIBCDenom("channel-1", params.offerDenom)))
                .toBase64(),
              bcs
                .vector(bcs.vector(bcs.vector(bcs.u8())))
                .serialize([
                  [bcs.u8().serialize(1).toBytes(), bcs.address().serialize(denomToMetadata("uinit")).toBytes()],
                  [bcs.u8().serialize(0).toBytes(), bcs.address().serialize("0x1001").toBytes()],
                ])
                .toBase64(),
              bcs.u64().serialize("1000").toBase64(),
              bcs.option(bcs.u64()).serialize(null).toBase64(),
              bcs.string().serialize(recipientAddress).toBase64(),
              bcs.string().serialize("transfer").toBase64(),
              bcs.string().serialize("channel-2").toBase64(),
              bcs.string().serialize("").toBase64(),
            ],
          },
        },
      }),
    )
  })
})

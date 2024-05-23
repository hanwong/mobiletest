import createHTTPClient from "../http"
import type { Paginated } from "../pagination"
import { getNextPageParams } from "../pagination"

interface ViewFunctionParams {
  moduleAddress: string
  moduleName: string
  functionName: string
  type_args: string[]
  args: string[]
}

function createInitiaMoveClient(rest: string) {
  const { getAll, get, post } = createHTTPClient(rest)

  const basePath = "initia/move/v1"

  async function params() {
    const path = `${basePath}/params`
    const { params } = await get<{ params: {} }>(path)
    return params
  }

  async function denom(metadata: string) {
    const path = `${basePath}/denom`
    const { denom } = await get<{ denom: string }>(path, { metadata })
    return denom
  }

  async function metadata(denom: string) {
    const path = `${basePath}/metadata`
    const { metadata } = await get<{ metadata: string }>(path, { denom })
    return metadata
  }

  async function resource<T>(address: string, structTag: string): Promise<T> {
    const path = `${basePath}/accounts/${address}/resources/by_struct_tag`
    const { resource } = await get<{ resource: { move_resource: string } }>(path, { struct_tag: structTag })
    return JSON.parse(resource.move_resource).data
  }

  async function resources(address: string) {
    type Resource = { move_resource: string }

    const path = `${basePath}/accounts/${address}/resources`
    const resources = await getAll<Paginated<{ resources: Resource[] }>, Resource>(
      path,
      undefined,
      getNextPageParams,
      ({ resources }) => resources,
    )

    return resources.map(({ move_resource }) => JSON.parse(move_resource))
  }

  async function view<T>({ moduleAddress, moduleName, functionName, type_args, args }: ViewFunctionParams) {
    const path = `initia/move/v1/accounts/${moduleAddress}/modules/${moduleName}/view_functions/${functionName}`
    const payload = { type_args, args }
    const { data } = await post<{ data: string }>(path, payload)
    return JSON.parse(data) as T
  }

  return {
    rest,
    params,
    denom,
    metadata,
    resource,
    resources,
    view,
  }
}

export default createInitiaMoveClient

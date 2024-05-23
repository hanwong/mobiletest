import BigNumber from "bignumber.js"
import Num from "../../../components/Num"

interface Props {
  price: string | number
  offerSymbol: string
  askSymbol: string
}

const Price = ({ offerSymbol, askSymbol, ...props }: Props) => {
  if (!props.price) return null

  const price = BigNumber(props.price)

  return price.gt(1) ? (
    <>
      <Num amount={1} symbol={offerSymbol} decimals={0} /> ={" "}
      <Num amount={price.toString()} symbol={askSymbol} decimals={0} fixedByAmount />
    </>
  ) : (
    <>
      <Num amount={1} symbol={askSymbol} decimals={0} /> ={" "}
      <Num amount={BigNumber(1).div(price).toString()} symbol={offerSymbol} decimals={0} fixedByAmount />
    </>
  )
}

export default Price

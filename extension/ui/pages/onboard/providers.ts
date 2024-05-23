import google from "./logos/google.png"
import apple from "./logos/apple.png"
import facebook from "./logos/facebook.png"
import twitter from "./logos/twitter.png"
import linkedin from "./logos/linkedin.png"
import reddit from "./logos/reddit.png"
import discord from "./logos/discord.png"
import twitch from "./logos/twitch.png"
import github from "./logos/github.png"
import line from "./logos/line.png"
import kakao from "./logos/kakao.png"
import weibo from "./logos/weibo.png"
import wechat from "./logos/wechat.png"

const providers = new Map([
  ["google", { logo: google, index: true }],
  ["twitter", { logo: twitter, index: true }],
  ["discord", { logo: discord, index: true }],
  ["facebook", { logo: facebook }],
  ["apple", { logo: apple }],
  ["twitch", { logo: twitch }],
  ["reddit", { logo: reddit }],
  ["github", { logo: github }],
  ["linkedin", { logo: linkedin }],
  ["line", { logo: line }],
  ["kakao", { logo: kakao }],
  ["weibo", { logo: weibo }],
  ["wechat", { logo: wechat }],
])

export default providers

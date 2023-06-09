import Image from "next/image";

import { type RouterOutputs } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Link from "next/link";

dayjs.extend(relativeTime)

type PostWithUser = RouterOutputs["posts"]["getAll"][number];
export const PostView = (props: PostWithUser) => {
  const { post, author } = props;

  return (
    <div className="flex p-4 boder-b border-slate-400 gap-3">
      <Image 
        src={author.profileImageUrl} 
        className="w-14 h-14 rounded-full" 
        alt={`@${author.username}'s profile picture`} 
        width="56" 
        height="56"
      />
      <div className="flex flex-col">
        <div className="flex text-slate-300 gap-1">
          <Link href={`/@${author.username}`}><span>{`@${author.username}`}</span></Link>
          <Link href={`/posts/${post.id}`}><span className="font-thin">{`· ${dayjs(post.createdAt).fromNow()}`}</span></Link>
        </div>
        <span className="text-2xl">{post.content}</span>
      </div>
    </div>

  )
}
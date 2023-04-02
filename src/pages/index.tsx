import { type NextPage } from "next";
import Image from "next/image";
import Head from "next/head";
import { useUser, SignInButton } from "@clerk/nextjs";

import { api, type RouterOutputs } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { LoadingPage, LoadingSpinner } from "~/components/LoadingSpinner";
import { useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { Layout } from "~/components/Layout";

dayjs.extend(relativeTime);

const CreatePostWizard = () => {
  const { user } = useUser();

  const [input, setInput] = useState("");

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if(errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0])
      } else {
        toast.error("Failed to post! Please try again later.");
      }
    }
  });

  if(!user) return null;

  return (
    <div className="flex gap-3 w-full">
      <Image 
        src={user.profileImageUrl}
        alt="Profile Image"
        className="w-14 h-14 rounded-full"
        width="56"
        height="56"
      />
      <input 
        placeholder="Type some emojis!" 
        className="bg-transparent grow outline-none"
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={(e) => {
          if(e.key === "Enter" && !isPosting) {
            e.preventDefault();

            if(input !== "") {
              mutate({ content: input });
            }
          }
        }}
      />
      {input !== "" && !isPosting && (
          <button onClick={() => mutate({ content: input })}>Post</button>
      )}

      {isPosting && (
        <div className="flex justify-center items-center">
          <LoadingSpinner size={20}/>
        </div>
      )}
    </div>
  )
}

type PostWithUser = RouterOutputs["posts"]["getAll"][number];
const PostView = (props: PostWithUser) => {
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

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

  if(postsLoading) return <LoadingPage />;

  if(!data) return <div>Something went wrong</div>;

  return (
    <div className="flex flex-col">
      {data?.map((fullPost) => <PostView key={fullPost.post.id} {...fullPost}/>)}
    </div>
  )
}

const Home: NextPage = () => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  api.posts.getAll.useQuery();

  if(!userLoaded ) return <div></div>

  return (
    <Layout>
      <div className="flex border-b border-slate-400 p-4">
        {!isSignedIn && (
          <div className="flex justify-center">
            <SignInButton />
          </div>
        )}

        {!!isSignedIn && (
          <CreatePostWizard />
        )}
      </div>

      <Feed />
    </Layout>
  );
};

export default Home;

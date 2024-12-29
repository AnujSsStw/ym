"use client";

import { useState } from "react";
import Image from "next/image";
import { UserPlus, Users } from "lucide-react";
import { api, RouterOutputs } from "@/trpc/react";
import { User } from "next-auth";

export function UserProfile({
  data,
  isFollowing,
  usr,
}: {
  data: RouterOutputs["user"]["getProfile"];
  isFollowing: boolean;
  usr: User | undefined;
}) {
  const [following, setFollowing] = useState(isFollowing);
  const [followers, setFollowers] = useState(data?.followerCount!);
  const f = api.user.followUser.useMutation();

  const handleFollow = async () => {
    setFollowing(!following);
    setFollowers(following ? followers - 1 : followers + 1);
    // TODO: Implement API call to update follow status
    f.mutate({ id: data?.id! });

    console.log(`${following ? "Unfollowing" : "Following"} user: ${data?.id}`);
  };

  return (
    <div className="flex flex-col items-center rounded-lg bg-white p-6 shadow-md">
      <Image
        src={data?.image!}
        alt={data?.name!}
        width={120}
        height={120}
        className="mb-4 rounded-full"
      />
      <h2 className="mb-2 text-2xl font-bold">{data?.name}</h2>
      {/* <p className="mb-4 text-center text-gray-600">{bio}</p> */}
      <div className="mb-4 flex w-full justify-between">
        <div className="text-center">
          <p className="font-semibold">{data?.recipeCount}</p>
          <p className="text-gray-600">Recipes</p>
        </div>
        <div className="text-center">
          <p className="font-semibold">{followers}</p>
          <p className="text-gray-600">Followers</p>
        </div>
        <div className="text-center">
          <p className="font-semibold">{data?.followingCount}</p>
          <p className="text-gray-600">Following</p>
        </div>
      </div>
      <button
        disabled={!usr || usr.id === data?.id}
        onClick={handleFollow}
        className="flex w-full justify-center rounded-md bg-slate-900 py-2 font-semibold text-white disabled:cursor-not-allowed"
      >
        {following ? (
          <>
            <Users className="mr-2 h-5 w-5" />
            Following
          </>
        ) : (
          <>
            <UserPlus className="mr-2 h-5 w-5" />
            Follow
          </>
        )}
      </button>
    </div>
  );
}

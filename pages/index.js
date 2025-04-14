import Layout from "@/components/Layout";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  return (
    <Layout>
      <div className="text-stone-900 flex justify-between">
        <h2>
          Hola, <b>{session?.user?.name}</b>
        </h2>
        <div className="flex bg-gray-300 text-black gap-1 rounded-full">
          <img
            src={session?.user?.image}
            className="w-10 h-10 rounded-full"
          ></img>
        </div>
      </div>
    </Layout>
  );
}

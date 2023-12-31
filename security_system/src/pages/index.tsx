import { useSession } from "next-auth/react";
import Head from "next/head";
import { AuthButton } from "~/components/authButton";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BsHouseLock } from "react-icons/bs";

export default function Home() {
  // const getData = api.data.getData.useQuery();
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.status === "authenticated") {
      router.push("/dashboard");
    }
  }, [session?.status, router]);

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className=" flex min-h-screen flex-col items-center justify-center ">

        <BsHouseLock className="text-7xl mb-7" />

        <h1 className="text-xl font-medium pb-2">
          Safe Space
        </h1>

        <p className="text-gray-500 pb-8">
          This is a security system to monitor your house.
          <br />
          Make sure to sign in to access your dashboard.
        </p>

        <AuthButton />

      </main>
    </>
  );
}


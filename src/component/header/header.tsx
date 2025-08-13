import { getuser } from "./actions";
import { redirect } from "next/navigation";
import styles from "./header.module.css";

export default async function Header() {
    const user = await getuser();
    async function handleLogin() {
        "use server";
        redirect("/auth/login");
        }

        async function handleLogout() {
        "use server";
        redirect("/auth/logout");
      }
  return (
    <header className="h-14 flex flex-row items-center">
      <h1 className="ml-5 text-center text-3xl font-bold">tapla</h1>
        {user ? (
          <form action={handleLogout} className="mr-5 flex ">
            <p>ログイン中: {user.email}</p>
            <button type="submit">ログアウト</button>
          </form>
        ) : (
          <form action={handleLogin} className="mr-5 flex">
            <p>ログインしていません</p>
            <button type="submit">ログイン</button>
          </form>
        )}
    </header>
  );
}

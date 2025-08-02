import { getuser } from "./actions";
import { redirect } from "next/navigation";

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
    <header>
      <h1>tapla</h1>
      <div>
        {user ? (
          <form action={handleLogout}>
            <p>ログイン中: {user.email}</p>
            <button type="submit">ログアウト</button>
          </form>
        ) : (
          <form action={handleLogin}>
            <p>ログインしていません</p>
            <button type="submit">ログイン</button>
          </form>
        )}
      </div>
    </header>
  );
}

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
    <header className={styles.header}>
      <h1 className={styles.title}>tapla</h1>
        {user ? (
          <form action={handleLogout} className={styles.authParent}>
            <p>ログイン中: {user.email}</p>
            <button type="submit">ログアウト</button>
          </form>
        ) : (
          <form action={handleLogin} className={styles.authParent}>
            <p>ログインしていません</p>
            <button type="submit">ログイン</button>
          </form>
        )}
    </header>
  );
}

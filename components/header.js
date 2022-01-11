import React from "react";
import { Anchor, Layout} from "antd";

const { Link } = Anchor;
const { Header } = Layout;

// function loggingOut() {
//   if (localStorage.getItem('user')) {
//     localStorage.removeItem('user');
//   }
//   sessionStorage.removeItem('user');
// }

// function LoginLogout({ props }) {
//   if (props.sStorage || props.lStorage) {
//     return (
//       <Anchor onClick={loggingOut}>
//         <Link href='/' title="Logout" />
//       </Anchor>
//     );
//   }

//   return <Link href="/login" title="Login" />;
// }

// export default function PageHeader({ isLoggedIn }) {
//   return (
//     <Header style={{ backgroundColor: "#DADADA" }}>
//       <div className="header">
//         <Anchor targetOffset="65">
//           <div id="logo">
//             <Link href="/" title="MESEKAI" />
//           </div>
//           <Link href="/#base" title="Home" />
//           <Link href="/#about" title="About Us" />
//           <Link href="/#members" title="Dev Team" />
//           <LoginLogout props={isLoggedIn} />
//         </Anchor>
//       </div>
//     </Header>
//   );
// }

export default function PageHeader() {
    return (
        <Header style={{ backgroundColor: "#DADADA" }}>
            <div className="header">
                <Anchor targetOffset="65">
                    <div id="logo">
                        <Link href="/" title="MESEKAI" />
                    </div>
                    <Link href="/#base" title="Home" />
                    <Link href="/#about" title="About" />
                    <Link href="/#members" title="Dev Team" />
                    <Link href="/login" title="Log In" />
                </Anchor>
            </div>
        </Header>
    );
}

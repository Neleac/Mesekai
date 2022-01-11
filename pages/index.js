import PageHeader from "../components/header";
import PageFooter from "../components/footer";
import MembersPage from "../components/home/members";
import Landing from "../components/home/landing";
import AboutPage from "../components/home/about";
import React from "react";

export default function Home() {
  // const [sStorage, setSStorage] = React.useState(null);
  // const [lStorage, setLStorage] = React.useState(null);
  // React.useEffect(() => {
  //   if (!sessionStorage.getItem('user') && localStorage.getItem('user')) {
  //     sessionStorage.setItem('user', localStorage.getItem('user'));
  //   }
  //   setSStorage(sessionStorage.getItem('user'));
  //   setLStorage(localStorage.getItem('user'));
  // }, [sStorage, lStorage]);

  // return (
  //   <div>
  //     <PageHeader isLoggedIn={{sStorage: sStorage, lStorage: lStorage}} />
  //     <Landing />
  //     <AboutPage />
  //     <MembersPage />
  //     <PageFooter />
  //   </div>
  // );

    return (
        <>
            <PageHeader />
            <Landing />
            <AboutPage />
            <MembersPage />
            <PageFooter />
        </>
    );
}

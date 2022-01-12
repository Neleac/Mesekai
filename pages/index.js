import PageHeader from "../components/header";
import PageFooter from "../components/footer";
import MembersPage from "../components/home/members";
import Landing from "../components/home/landing";
import AboutPage from "../components/home/about";

export default function Home() {
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

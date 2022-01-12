import React from "react";
import Image from "next/image";
import { Carousel } from "antd";

const bios = [
    {
        key: "caelen",
        memberName: "Caelen Wang",
        memberRole: "Team Lead",
        memberBio:
            "I'm a graduate student studying computer science at San Francisco State University " +
            "interested in developing virtual, augmented, and mixed reality applications. " +
            "Before coming to the Bay Area, I lived in Beijing, Washington D.C., and Seattle. " +
            "I enjoy rock climbing, snowboarding, and surfing. ",
    },
    {
        key: "vasu",
        memberName: "Vasudevan Venugopal",
        memberRole: "Frontend Lead",
        memberBio:
            "I am an undergraduate student studying computer science at San Francisco State University. " +
            "I have lived in the Bay Area for most of my life, but before that, I lived in India and Los Angeles. " +
            "My hobbies include working out, playing videogames, reading, and hanging with friends.",
    },
    {
        key: "matthew",
        memberName: "Matthew Madore",
        memberRole: "Backend Lead",
        memberBio:
            "I'm an undergraduate student studying computer science at San Francisco State University. " +
            "I am a Bay Area native but now live in Portland, Oregon. I was a music teacher for several " +
            "years before returning to school full-time to pursue my new passion of learning how computers work. " +
            "After I complete my degree I would be interested in artificial intelligence or game design and devolopment.",
    },
    {
        key: "jose",
        memberName: "Jose Atienza",
        memberRole: "Scrum Master",
        memberBio:
            "I am a 4th year undergrad student majoring in computer science and hope to get into software development after I graduate. " +
            "I am from Rancho Cucamonga, California and moved to San Francisco for college. " +
            "My hobbies include reading manga, watching anime, and playing videogames. " +
            "I also played for my school's rugby team and have grown to love the sport.",
    },
    {
        key: "eugene",
        memberName: "Eugene San Juan",
        memberRole: "Git Master",
        memberBio:
            "I'm currently an undergrad student majoring in computer science and aim to get into the IT field after graduation. " +
            "I've lived in the Bay Area for most of my life, moving around between SF, Daly City, and South City. " +
            "In my free time I enjoy watching/playing basketball as well as listening to music and sometimes playing games.",
    },
    {
        key: "mohammad",
        memberName: "Mohammad Abdelrahman",
        memberRole: "Database Admin",
        memberBio:
            "I'm a computer science undergraduate student passionate about software development. "
    },
];

export default function MembersPage() {
    return (
        <div id="members">
            <div id="Title">Meet the Team</div>
            <Carousel autoplay autoplaySpeed={10000} style={{ display: "block" }}>
            {bios.map((bios) => {
                return (
                <div id="carousel-container" key={bios.key}>
                    <h1>{bios.memberName}</h1>
                    <h2>({bios.memberRole})</h2>
                    <h3>
                        <Image
                            src={`/team/${bios.key}.jpg`}
                            alt="member-pictures"
                            width="400%"
                            height="400%"
                        />
                    </h3>
                    <p>{bios.memberBio}</p>
                </div>
                );
            })}
            </Carousel>
        </div>
    );
}

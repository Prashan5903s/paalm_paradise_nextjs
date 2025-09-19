import TeamCard from "@/components/teamCard";

const teams = [
    {
        id: 1,
        name: 'Sales team',
        description: 'This is sales team',
        image: '/images/apps/academy/1.png',
        memberCount: 1,
    },
    {
        id: 2,
        name: 'ABC',
        description: 'sdcssdssf',
        image: '/images/apps/academy/2.png',
        memberCount: 1,
    },
]


export default  function MyTeam() {
    return (
        <>
            <TeamCard teams={teams} />
        </>
    )
}

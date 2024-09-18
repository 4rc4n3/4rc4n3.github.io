import {InstallationDTO, InstallationsDTO, RepositoriesDTO} from "./api";
import {useQuery} from "@tanstack/react-query";
import {Loader} from "./Loader";
import * as React from "react";
import {Usage} from "./Usage";

const Installation = ({id}: InstallationDTO) => {
    const {data: repositories, isLoading} = useQuery<RepositoriesDTO, void, string[]>({
        queryKey: ['github', 'user', 'installations', id, 'repositories'],
        select: (data) => data.repositories.map(({full_name}) => full_name)
    });

    if (isLoading) {
        return <Loader/>
    }

    return <Usage repositories={repositories}/>
}

export const Installations = () => {
    const {data, isLoading} = useQuery<InstallationsDTO>({
        queryKey: ['github', 'user', 'installations'],
    });

    if (isLoading) {
        return <Loader/>
    }

    return <>{data?.installations.map((installation) => <Installation {...installation} key={installation.id}/>)}</>

}

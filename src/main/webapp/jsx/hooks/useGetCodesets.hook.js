import { useQuery } from "react-query";
import { getCodesets } from "../services/getCodesets.service";

export const useGetCodesets = ({
    codesetsKeys,
    onSuccess: onSuccessEffect
}) => {

    const { data, isLoading, isError } = useQuery(
        ["FETCH_CODESETS", ...codesetsKeys],
        () => getCodesets(...codesetsKeys), {

        onSuccess: (data) => {
            onSuccessEffect(data)
        }

    }
    );
    return {
        data,
        isLoading,
        isError,
    };
};
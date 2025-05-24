import { useQuery } from "react-query";
import { getCodesets } from "../services/getCodesets.service";

export const useGetCodesets = ({
    codesetsKeys,
    patientId,
    onSuccess: onSuccessEffect
}) => {

    const { data, isLoading, isError } = useQuery(
        ["FETCH_CODESETS", ...codesetsKeys, patientId],
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
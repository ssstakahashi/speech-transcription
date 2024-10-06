import { atom } from 'jotai'
import { atomWithStorage, createJSONStorage } from "jotai/utils";

export type RecordType = {
    recordId: string
    role: string
    recordText: string
    createAt: string
}

const recordStorage = createJSONStorage<RecordType[]>(() => localStorage);
export const resultTextAtom = atomWithStorage<RecordType[]>(
	"recordStorage",
	[],
	recordStorage,
	{ getOnInit: true },
);

export const micPermissionAtom = atom<boolean>(false);

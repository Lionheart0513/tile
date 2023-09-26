import { getList, registerRecord, updateRecord, deleteRecord } from '$lib/server/db';
import { error, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (() => {
	const list = getList();
    
	return {
		list
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	registerRecord: async ({ request }) => {
		const data = await request.formData();

		const name = data.get('name')?.toString();

		const description = data.get('description')?.toString();

		if (!(name && description)) {
			throw error(400, 'Invalid input Data');
		}

		registerRecord(name, description);
	},

	updateRecord: async ({ request }) => {
		const data = await request.formData();

		const selectId = parseInt(data.get('selectId')?.toString());
		const name = data.get('name_' + selectId)?.toString();
		const description = data.get('description_' + selectId)?.toString();
		
		if (!(selectId && name && description)) {
			throw error(400, 'Invalid input Data');
		}
		updateRecord(selectId, name, description);
	},

	deleteRecord: async ({ request }) => {
		const data = await request.formData();

		const selectId = parseInt(data.get('selectId')?.toString());
		
		if (!(selectId)) {
			throw error(400, 'Invalid input Data');
		}
		deleteRecord(selectId);
	}
};

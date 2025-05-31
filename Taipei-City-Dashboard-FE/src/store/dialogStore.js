// Developed by Taipei Urban Intelligence Center 2023-2024//

/* dialogStore */
/*
The dialogStore stores all states related to the popups and dialogs in the application.
To add a new dialog to the existing list, simply give the dialog a name and add it to "dialogs".
Then, in the component add a conditional statement to render the component only if it's value is switched to true.
Finally, remember to add the component to the application.
*/

import { defineStore } from "pinia";

export const useDialogStore = defineStore("dialog", {
	state: () => ({
		dialogs: {
			// Admin Dialogs: /components/dialogs/admin
			adminComponentSettings: false,
			adminAddEditDashboards: false,
			adminEditIssue: false,
			adminEditDisaster: false,
			adminAddComponent: false,
			adminDeleteDashboard: false,
			adminEditUser: false,
			adminAddEditContributor: false,
			adminDeleteContributor: false,
			adminAddComponentTemplate: false, // BETA
			// Public Dialogs: /components/dialogs
			addComponent: false,
			addDashboard: false,
			dashboardSettings: false,
			addEditDashboards: false,
			initialWarning: false,
			login: false,
			mobileLayers: false,
			mobileNavigation: false,
			moreInfo: false,
			notificationBar: false,
			reportIssue: false,
			userSettings: false,
			embedComponent: false,
			incidentReport: false, // BETA
			contributorsList: false,
			contributorInfo: false,
			addPin: false,
			addViewPoint: false,
			findClosestPoint: false,
		},
		// Stores the content for notifications
		notification: {
			status: "",
			message: "",
		},
		// Stores the content for report issue dialogs
		issue: {
			id: null,
			index: null,
			name: "",
		},
		// Stores the content for more info dialogs
		moreInfoContent: null,
		// Stores Edit or Add mode for addeditdashboards dialog
		addEdit: "",
		// Stores the current timeout for notifications
		curTimeout: null,
	}),
	getters: {},
	actions: {
		// Show the dialog passed into the function
		showDialog(dialog) {
			this.dialogs[dialog] = true;
		},
		// Will hide all dialogs currently active
		hideAllDialogs() {
			const keys = Object.keys(this.dialogs);
			for (let i = 0; i < keys.length; i++) {
				if (keys[i] === "notificationBar") {
					continue;
				}
				this.dialogs[keys[i]] = false;
			}
			this.moreInfoContent = null;
		},
		// Show the notification bar and update the notification message
		showNotification(status, message, showtime = 3000) {
			this.dialogs.notificationBar = false;
			clearTimeout(this.curTimeout);
			setTimeout(() => {
				this.showDialog("notificationBar");
			}, 20);
			this.notification = {
				status: status, // success, fail, info
				message: message,
			};
			this.curTimeout = setTimeout(() => {
				this.dialogs.notificationBar = false;
			}, showtime);
		},
		// Show the more info dialog and update the content
		async showMoreInfo(content) {
			// 先顯示彈窗
			this.showDialog("moreInfo");
			this.moreInfoContent = content;
			
			// 調用熱門組件API序列
			await this.handleHotComponentAPIs(content.index);
		},
		// 處理熱門組件API調用序列
		async handleHotComponentAPIs(componentIndex) {
			try {
				const { useContentStore } = await import("./contentStore");
				const contentStore = useContentStore();

				
				// 第一支API：檢查排名

				const checkResult = await contentStore.checkRank();
				
				// 第二支API：增加點擊次數

				const plusOneResult = await contentStore.plusOne(componentIndex);

				
				// 第三支API：比較排名

				const compareResult = await contentStore.compareRank();

				
				// 判斷是否需要重新載入頁面（只有在熱門dashboard且排名有變動時）
				const hotDashboardIndex = 'db0f3c5e9222';

				
				if (compareResult.status === 'render' && contentStore.currentDashboard.index === hotDashboardIndex) {

					
					
					// 重新載入當前dashboard的數據
					await contentStore.setCurrentDashboardAllContent();
					

				}else {
					console.log(' 不滿足重新載入條件');
					
					
				}
				
			} catch (error) {

				this.showNotification('fail', '無法更新組件熱門度，請稍後再試');
			}
		},

		// Show the report issue dialog and enter the id and name of the component of origin
		showReportIssue(id, index, name) {
			this.showDialog("reportIssue");
			this.issue = {
				id: id,
				index: index,
				name: name,
			};
		},
	},
});

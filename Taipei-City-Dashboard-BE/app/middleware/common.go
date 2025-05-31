// Package middleware includes all middleware functions used by the APIs.
/*
Developed By Taipei Urban Intelligence Center 2023-2024

// Lead Developer:  Igor Ho (Full Stack Engineer)
// Systems & Auth: Ann Shih (Systems Engineer)
// Data Pipelines:  Iima Yu (Data Scientist)
// Design and UX: Roy Lin (Prev. Consultant), Chu Chen (Researcher)
// Testing: Jack Huang (Data Scientist), Ian Huang (Data Analysis Intern)
*/
package middleware

import (
	"TaipeiCityDashboardBE/app/models"
	"TaipeiCityDashboardBE/app/util"
	"net/http"

	"github.com/gin-gonic/gin"
)

// AddCommonHeaders adds common headers that will be appended to all requests.
func AddCommonHeaders(c *gin.Context) {
	// 允許所有來源，不做任何限制
	c.Header("Access-Control-Allow-Origin", "*")
	// 允許所有可能的請求頭
	c.Header("Access-Control-Allow-Headers", "*")
	// 允許所有可能的請求方法
	c.Header("Access-Control-Allow-Methods", "*")
	// 暴露所有頭部
	c.Header("Access-Control-Expose-Headers", "*")
	// 不使用 credentials 模式，避免與 * 衝突
	c.Header("Access-Control-Allow-Credentials", "false")
	// 設置更長的預檢請求緩存時間，減少預檢請求次數
	c.Header("Access-Control-Max-Age", "86400")

	// 處理 OPTIONS 預檢請求
	if c.Request.Method == "OPTIONS" {
		c.AbortWithStatus(http.StatusOK) // 改用 200 而不是 204
	}

	c.Next()
}

// IsLoggedIn checks if user is logged in.
func IsLoggedIn() gin.HandlerFunc {
	return func(c *gin.Context) {
		loginType := c.GetString("loginType")
		if loginType != "no login" {
			c.Next()
			return
		}
		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"status": "error", "message": "Unauthorized"})
	}
}

// IsSysAdm checks if user is system admin.
func IsSysAdm() gin.HandlerFunc {
	return func(c *gin.Context) {
		_, _, isAdmin, _, _ := util.GetUserInfoFromContext(c)
		if isAdmin {
			c.Next()
			return
		}
		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"status": "error", "message": "Unauthorized"})
	}
}

// LimitRequestTo checks if the permissions contain a specific permission.
func LimitRequestTo(permission models.Permission) gin.HandlerFunc {
	return func(c *gin.Context) {
		_, _, _, _, permissions := util.GetUserInfoFromContext(c)
		for _, perm := range permissions {
			if perm.GroupID == permission.GroupID && perm.RoleID == permission.RoleID {
				c.Next()
				return
			}
		}
		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"status": "error", "message": "Unauthorized"})
	}
}

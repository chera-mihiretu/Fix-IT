package infrastructure

import (
	"fmt"
	"time"
)

func GetUniqueFileName() string {
	return time.Now().Format("20060102150405") + fmt.Sprintf("%06d", time.Now().Nanosecond()/1000) + ".pdf"
}

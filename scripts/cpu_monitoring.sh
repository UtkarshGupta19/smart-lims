#!/usr/bin/env bash
# SMART-LIMS Linux Shell Script: CPU Load Monitoring
echo "[SMART-LIMS OS MON] CPU Load Average"
sysctl -n sysctl.proc_translated 2>/dev/null || sysctl -n vm.loadavg 2>/dev/null || uptime

#!/usr/bin/env bash
# SMART-LIMS Linux Shell Script: Memory Utilization
echo "[SMART-LIMS OS MON] Host Memory Statistics"
vm_stat || free -m

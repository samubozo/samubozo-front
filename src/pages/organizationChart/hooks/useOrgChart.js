
// src/pages/organizationChart/hooks/useOrgChart.js
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import axiosInstance from '../../../configs/axios-config';
import { API_BASE_URL, HR } from '../../../configs/host-config';

export function useOrgChart() {
  // Data States
  const [members, setMembers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  // UI States
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab =
    localStorage.getItem('orgchartTab') || searchParams.get('tab') || 'team';
  const [tab, setTab] = useState(initialTab);
  const [search, setSearch] = useState('');
  const [deptView, setDeptView] = useState(null);

  // Filter/Sort States
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Modal States
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberDetail, setShowMemberDetail] = useState(false);
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMessageWriteModal, setShowMessageWriteModal] = useState(false);
  const [messageReceiver, setMessageReceiver] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // --- DATA FETCHING ---
  const loadMembers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}${HR}/user/list`);
      const result = response.data?.result;
      const membersData = Array.isArray(result?.content) ? result.content : [];
      const processedMembers = membersData.map((member) => ({
        ...member,
        departmentName: member.department?.name || '부서 없음',
        departmentColor: member.department?.departmentColor || '#e6f0fb',
        departmentId: member.department?.departmentId,
      }));
      setMembers(processedMembers);
    } catch (error) {
      console.error('Failed to load members:', error);
      setMembers([]);
    }
    setLoading(false);
  }, []);

  const loadDepartments = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}${HR}/departments`);
      const departmentsData = Array.isArray(response.data.result)
        ? response.data.result
        : [];
      setDepartments(departmentsData);
    } catch (error) {
      console.error('Failed to load departments:', error);
      setDepartments([]);
    }
  }, []);

  useEffect(() => {
    loadMembers();
    loadDepartments();
  }, [loadMembers, loadDepartments]);

  // --- DERIVED DATA (MEMOIZED) ---
  const filteredMembers = useMemo(() => {
    let filtered = [...members];
    if (selectedTeam !== 'all') {
      filtered = filtered.filter((user) => user.departmentName === selectedTeam);
    }
    if (search) {
      filtered = filtered.filter(
        (u) =>
          u.userName?.includes(search) ||
          u.positionName?.includes(search) ||
          u.departmentName?.includes(search),
      );
    }
    return filtered.sort((a, b) => {
      const nameA = a.userName || '';
      const nameB = b.userName || '';
      return sortOrder === 'asc'
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    });
  }, [members, selectedTeam, search, sortOrder]);

  const filteredDepartments = useMemo(() => {
    let filtered = [...departments];
    if (search) {
      const deptNamesWithMembers = [
        ...new Set(filteredMembers.map((m) => m.departmentName)),
      ];
      filtered = filtered.filter((dept) =>
        deptNamesWithMembers.includes(dept.name),
      );
    }
    return filtered.map((dept) => {
      const deptMembers = members.filter(
        (m) => m.departmentId === dept.departmentId,
      );
      const deptImageUrl =
        deptMembers.length > 0 ? deptMembers[0].department?.imageUrl : null;
      return {
        ...dept,
        count: deptMembers.length,
        image:
          dept.imageUrl ||
          deptImageUrl ||
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDMyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjE2MCIgeT0iNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkRlcGFydG1lbnQ8L3RleHQ+Cjwvc3ZnPgo=',
      };
    });
  }, [departments, search, filteredMembers, members]);

  const deptMembers = useMemo(() => {
    if (!deptView) return [];
    return filteredMembers.filter((u) => u.departmentName === deptView.name);
  }, [deptView, filteredMembers]);

  // --- HANDLERS ---
  const handleTabChange = useCallback(
    (newTab) => {
      setTab(newTab);
      setSearchParams({ ...Object.fromEntries(searchParams), tab: newTab });
      localStorage.setItem('orgchartTab', newTab);
    },
    [searchParams, setSearchParams],
  );

  useEffect(() => {
    const urlTab = searchParams.get('tab');
    if (urlTab && urlTab !== tab) {
      setTab(urlTab);
      localStorage.setItem('orgchartTab', urlTab);
    }
  }, [searchParams, tab]);

  const handleSendMessage = useCallback((member) => {
    setMessageReceiver({
      id: member.employeeNo || member.id,
      name: member.userName || member.name,
      dept: member.departmentName || member.department?.name || '',
    });
    setShowMessageWriteModal(true);
  }, []);

  const handleAddDept = useCallback(
    async (newDept) => {
      try {
        const formData = new FormData();
        formData.append('name', newDept.name);
        formData.append('departmentColor', newDept.color);
        if (newDept.imageFile) {
          formData.append('departmentImage', newDept.imageFile);
        }
        await axiosInstance.post(`${API_BASE_URL}${HR}/departments`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        await loadDepartments();
        setSuccessMessage('부서가 추가되었습니다.');
        setShowSuccessModal(true);
        setShowAddDeptModal(false);
      } catch (error) {
        throw error;
      }
    },
    [loadDepartments],
  );

  const handleEditDept = useCallback(
    async (formData) => {
      if (!deptView) return;
      try {
        await axiosInstance.put(
          `${API_BASE_URL}${HR}/departments/${deptView.departmentId || deptView.id}`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } },
        );
        setSuccessMessage('부서 정보가 수정되었습니다.');
        setShowSuccessModal(true);
        setShowEditModal(false);
        await loadDepartments();
        await loadMembers();
        setDeptView((prev) =>
          prev
            ? {
                ...prev,
                name: formData.get('name'),
                departmentColor: formData.get('departmentColor'),
              }
            : null,
        );
      } catch (e) {
        setSuccessMessage(
          e.response?.data?.statusMessage || '부서 정보 수정 중 오류가 발생했습니다.',
        );
        setShowSuccessModal(true);
      }
    },
    [deptView, loadDepartments, loadMembers],
  );

  const handleDeleteDept = useCallback(async () => {
    if (!deptView) return;
    if (!window.confirm(`${deptView.name} 부서를 삭제하시겠습니까?`)) return;
    try {
      await axiosInstance.delete(
        `${API_BASE_URL}${HR}/departments/${deptView.departmentId || deptView.id}`,
      );
      setSuccessMessage('부서가 삭제되었습니다.');
      setShowSuccessModal(true);
      setDeptView(null);
      await loadDepartments();
    } catch (e) {
      setSuccessMessage(
        e.response?.status === 400
          ? '해당 부서에 소속된 직원이 있어 삭제할 수 없습니다.'
          : '부서 삭제 중 오류가 발생했습니다.',
      );
      setShowSuccessModal(true);
    }
  }, [deptView, loadDepartments]);

  // --- RETURN VALUES ---
  return {
    // Data
    loading,
    departments,
    filteredMembers,
    filteredDepartments,
    deptMembers,
    // UI State
    tab,
    search,
    deptView,
    selectedTeam,
    sortOrder,
    showFilterDropdown,
    showSortDropdown,
    // Modals
    selectedMember,
    showMemberDetail,
    showAddDeptModal,
    showEditModal,
    showMessageWriteModal,
    messageReceiver,
    showSuccessModal,
    successMessage,
    // Handlers
    setSearch,
    setDeptView,
    handleTabChange,
    setSelectedTeam,
    setSortOrder,
    setShowFilterDropdown,
    setShowSortDropdown,
    setSelectedMember,
    setShowMemberDetail,
    setShowAddDeptModal,
    setShowEditModal,
    handleSendMessage,
    setShowMessageWriteModal,
    setSuccessMessage,
    setShowSuccessModal,
    handleAddDept,
    handleEditDept,
    handleDeleteDept,
  };
}

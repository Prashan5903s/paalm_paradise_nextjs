"use client";

import { useEffect, useState } from "react";

import { useSession } from "next-auth/react";

import {
    Card,
    CardContent,
    Typography,
    RadioGroup,
    Skeleton,
    FormControlLabel,
    Radio,
    TextField,
    Button,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Paper,
} from "@mui/material";

import Grid from '@mui/material/Grid2'; // For Grid2

import { toast } from "react-toastify";


const MaintenanceSetting = () => {
    const { data: session } = useSession();
    const token = session?.user?.token;
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    const [costType, setCostType] = useState("1");
    const [data, setData] = useState(null);
    const [values, setValues] = useState({});
    
    const [unitData, setUnitData] = useState({
        unit_name: "",
        unit_value: ""
    });

    const handleValueChange = (type, newValue) => {
        setValues((prev) => ({
            ...prev,
            [type]: newValue,
        }));
    };

    const reset = () => {
        setData()
        fetchMaintenance()
    }

    const fetchMaintenance = async () => {
        try {

            const response = await fetch(`${API_URL}/company/maintenance-setting/${costType}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (response.ok) {
                const fixed_data = result?.data?.fixed_data;
                const unit_type = result?.data?.unit_type;

                const formattedData = fixed_data?.reduce((acc, item) => {
                    acc[item.apartment_type] = item.unit_value;
                    
                    return acc;
                }, {});

                setValues(formattedData || {});
                setUnitData(unit_type || { unit_name: "", unit_value: "" });
                setData(result?.data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (API_URL && token && costType) {
            setData(null);
            fetchMaintenance();
        }
    }, [API_URL, token, costType]);

    const handleSubmit = async () => {
        try {
            const payload = {
                unit_data: costType === "1" ? values : unitData,
                cost_type: costType
            };

            const response = await fetch(`${API_URL}/company/maintenance-setting/${costType}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok) {
                fetchMaintenance();
                toast.success("Maintenance setting updated successfully", { autoClose: 1000 });
            } else {
                toast.error(result.message || "Failed to update maintenance setting");
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        }
    };


    if (!data) {
        return (
            <Card sx={{ p: 2 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        <Skeleton width="60%" />
                    </Typography>
                    <Typography variant="subtitle2" gutterBottom>
                        <Skeleton width="40%" />
                    </Typography>

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid size={{ xs: 6 }} >
                            <Skeleton variant="rectangular" height={60} />
                        </Grid>
                        <Grid size={{ xs: 6 }} >
                            <Skeleton variant="rectangular" height={60} />
                        </Grid>
                    </Grid>

                    {costType === "1" && (
                        <Paper sx={{ mt: 4 }}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: "#f5f6f8" }}>
                                        <TableCell><Skeleton width="80%" /></TableCell>
                                        <TableCell><Skeleton width="50%" /></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {[1, 2, 3, 4].map((row) => (
                                        <TableRow key={row}>
                                            <TableCell><Skeleton /></TableCell>
                                            <TableCell><Skeleton /></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Paper>
                    )}

                    {costType === "2" && (
                        <Grid container spacing={2} sx={{ mt: 4 }}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Skeleton height={40} />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Skeleton height={40} />
                            </Grid>
                        </Grid>
                    )}

                    <Grid container justifyContent="flex-start" sx={{ mt: 3 }}>
                        <Skeleton variant="rectangular" width={120} height={40} />
                    </Grid>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card sx={{ p: 2 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Maintenance Settings
                </Typography>
                <Typography variant="subtitle2" gutterBottom>
                    Cost Type <span style={{ color: "red" }}>*</span>
                </Typography>

                <RadioGroup
                    row
                    value={costType}
                    onChange={(e) => setCostType(e.target.value)}
                    sx={{ gap: 2, mb: 2 }}
                >
                    <Card
                        variant="outlined"
                        sx={{
                            p: 2,
                            flex: 1,
                            cursor: "pointer",
                            borderColor: costType === "1" ? "primary.main" : "grey.300",
                        }}
                    >
                        <FormControlLabel
                            value="1"
                            control={<Radio />}
                            label={
                                <div>
                                    <Typography variant="body1">Fixed Value</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Maintenance cost will be fixed value for all apartments.
                                    </Typography>
                                </div>
                            }
                            sx={{ alignItems: "flex-start" }}
                        />
                    </Card>

                    <Card
                        variant="outlined"
                        sx={{
                            p: 2,
                            flex: 1,
                            cursor: "pointer",
                            borderColor: costType === "2" ? "primary.main" : "grey.300",
                        }}
                    >
                        <FormControlLabel
                            value="2"
                            control={<Radio />}
                            label={
                                <div>
                                    <Typography variant="body1">Unit Type</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Maintenance cost will be calculated based on the unit type.
                                    </Typography>
                                </div>
                            }
                            sx={{ alignItems: "flex-start" }}
                        />
                    </Card>
                </RadioGroup>

                {costType === "1" && (
                    <Paper sx={{ mt: 6 }}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: "#f5f6f8" }}>
                                    <TableCell><b>Apartment Type</b></TableCell>
                                    <TableCell><b>Unit Value ($)</b></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Object.entries(values).map(([apt, val]) => (
                                    <TableRow key={apt}>
                                        <TableCell>{apt + "BHK"}</TableCell>
                                        <TableCell>
                                            <TextField
                                                type="number"
                                                size="small"
                                                value={val}
                                                onChange={(e) => handleValueChange(apt, e.target.value)}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Paper>
                )}

                {costType === "2" && (
                    <Grid container spacing={2} sx={{ mt: 6 }}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Unit Name"
                                value={unitData?.unit_name || ""}
                                onChange={(e) =>
                                    setUnitData((prev) => ({ ...prev, unit_name: e.target.value }))
                                }
                                required
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Unit Value ($)"
                                value={unitData?.unit_value || ''}
                                onChange={(e) =>
                                    setUnitData((prev) => ({ ...prev, unit_value: e.target.value }))
                                }
                                required
                            />
                        </Grid>
                    </Grid>
                )}

                <Grid container gap={2} justifyContent="flex-start" sx={{ mt: 3 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                    >
                        Save
                    </Button>
                    <Button
                        variant="tonal"
                        color="secondary"
                        onClick={() => reset()}
                    >
                        Reset
                    </Button>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default MaintenanceSetting;

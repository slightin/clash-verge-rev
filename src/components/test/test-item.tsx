import { useEffect, useState } from "react";
import { useLockFn } from "ahooks";
import { useTranslation } from "react-i18next";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Box,
  Typography,
  Divider,
  MenuItem,
  Menu,
  styled,
  alpha,
} from "@mui/material";
import { BaseLoading } from "@/components/base";
import { LanguageTwoTone } from "@mui/icons-material";
import { Notice } from "@/components/base";
import { TestBox } from "./test-box";
import delayManager from "@/services/delay";
import { cmdTestDelay } from "@/services/cmds";
import { listen, Event, UnlistenFn } from "@tauri-apps/api/event";

interface Props {
  id: string;
  itemData: IVergeTestItem;
  onEdit: () => void;
  onDelete: (uid: string) => void;
}

let eventListener: UnlistenFn | null = null;

export const TestItem = (props: Props) => {
  const { itemData, onEdit, onDelete: onDeleteItem } = props;
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: props.id });

  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<any>(null);
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const [delay, setDelay] = useState(-1);
  const { uid, name, icon, url } = itemData;

  const onDelay = async () => {
    setDelay(-2);
    const result = await cmdTestDelay(url);
    setDelay(result);
  };

  const onEditTest = () => {
    setAnchorEl(null);
    onEdit();
  };

  const onDelete = useLockFn(async () => {
    setAnchorEl(null);
    try {
      onDeleteItem(uid);
    } catch (err: any) {
      Notice.error(err?.message || err.toString());
    }
  });

  const menu = [
    { label: "Edit", handler: onEditTest },
    { label: "Delete", handler: onDelete },
  ];

  const listenTsetEvent = async () => {
    if (eventListener !== null) {
      eventListener();
    }
    eventListener = await listen("verge://test-all", () => {
      onDelay();
    });
  };

  useEffect(() => {
    listenTsetEvent();
  }, []);

  return (
    <Box
      sx={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <TestBox
        onClick={onEditTest}
        onContextMenu={(event) => {
          const { clientX, clientY } = event;
          setPosition({ top: clientY, left: clientX });
          setAnchorEl(event.currentTarget);
          event.preventDefault();
        }}
      >
        <Box
          position="relative"
          sx={{ cursor: "move" }}
          ref={setNodeRef}
          {...attributes}
          {...listeners}
        >
          {icon && icon.trim() !== "" ? (
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              {icon.trim().startsWith("http") && (
                <img src={icon} height="40px" />
              )}
              {icon.trim().startsWith("data") && (
                <img src={icon} height="40px" />
              )}
              {icon.trim().startsWith("<svg") && (
                <img
                  src={`data:image/svg+xml;base64,${btoa(icon)}`}
                  height="40px"
                />
              )}
            </Box>
          ) : (
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <LanguageTwoTone sx={{ height: "40px" }} fontSize="large" />
            </Box>
          )}

          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Typography variant="h6" component="h2" noWrap title={name}>
              {name}
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ marginTop: "8px" }} />
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            marginTop: "8px",
            color: "primary.main",
          }}
        >
          {delay === -2 && (
            <Widget>
              <BaseLoading />
            </Widget>
          )}

          {delay === -1 && (
            <Widget
              className="the-check"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelay();
              }}
              sx={({ palette }) => ({
                ":hover": { bgcolor: alpha(palette.primary.main, 0.15) },
              })}
            >
              Check
            </Widget>
          )}

          {delay >= 0 && (
            // 显示延迟
            <Widget
              className="the-delay"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelay();
              }}
              color={delayManager.formatDelayColor(delay)}
              sx={({ palette }) => ({
                ":hover": {
                  bgcolor: alpha(palette.primary.main, 0.15),
                },
              })}
            >
              {delayManager.formatDelay(delay)}
            </Widget>
          )}
        </Box>
      </TestBox>

      <Menu
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorPosition={position}
        anchorReference="anchorPosition"
        transitionDuration={225}
        MenuListProps={{ sx: { py: 0.5 } }}
        onContextMenu={(e) => {
          setAnchorEl(null);
          e.preventDefault();
        }}
      >
        {menu.map((item) => (
          <MenuItem
            key={item.label}
            onClick={item.handler}
            sx={{ minWidth: 120 }}
            dense
          >
            {t(item.label)}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};
const Widget = styled(Box)(({ theme: { typography } }) => ({
  padding: "3px 6px",
  fontSize: 14,
  fontFamily: typography.fontFamily,
  borderRadius: "4px",
}));

import {
  alpha,
  Box,
  ListItemText,
  ListItemButton,
  Typography,
  styled,
} from "@mui/material";
import {
  ExpandLessRounded,
  ExpandMoreRounded,
  InboxRounded,
} from "@mui/icons-material";
import { HeadState } from "./use-head-state";
import { ProxyHead } from "./proxy-head";
import { ProxyItem } from "./proxy-item";
import { ProxyItemMini } from "./proxy-item-mini";
import type { IRenderItem } from "./use-render-list";
import { useVerge } from "@/hooks/use-verge";
import { useRecoilState } from "recoil";
import { atomThemeMode } from "@/services/states";

interface RenderProps {
  item: IRenderItem;
  indent: boolean;
  onLocation: (group: IProxyGroupItem) => void;
  onCheckAll: (groupName: string) => void;
  onHeadState: (groupName: string, patch: Partial<HeadState>) => void;
  onChangeProxy: (group: IProxyGroupItem, proxy: IProxyItem) => void;
}

export const ProxyRender = (props: RenderProps) => {
  const { indent, item, onLocation, onCheckAll, onHeadState, onChangeProxy } =
    props;
  const { type, group, headState, proxy, proxyCol } = item;
  const { verge } = useVerge();
  const enable_group_icon = verge?.enable_group_icon ?? true;
  const [mode] = useRecoilState(atomThemeMode);
  const isDark = mode === "light" ? false : true;
  const itembackgroundcolor = isDark ? "#282A36" : "#ffffff";

  if (type === 0 && !group.hidden) {
    return (
      <ListItemButton
        dense
        style={{
          background: itembackgroundcolor,
          height: "64px",
          margin: "8px 8px",
          borderRadius: "8px",
        }}
        onClick={() => onHeadState(group.name, { open: !headState?.open })}
      >
        {enable_group_icon &&
          group.icon &&
          group.icon.trim().startsWith("http") && (
            <img
              src={group.icon}
              height="32px"
              style={{ marginRight: "12px", borderRadius: "6px" }}
            />
          )}
        {enable_group_icon &&
          group.icon &&
          group.icon.trim().startsWith("data") && (
            <img
              src={group.icon}
              height="32px"
              style={{ marginRight: "12px", borderRadius: "6px" }}
            />
          )}
        {enable_group_icon &&
          group.icon &&
          group.icon.trim().startsWith("<svg") && (
            <img
              src={`data:image/svg+xml;base64,${btoa(group.icon)}`}
              height="32px"
            />
          )}
        <ListItemText
          primary={<StyledPrimary>{group.name}</StyledPrimary>}
          secondary={
            <ListItemTextChild
              color="text.secondary"
              sx={{
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                pt: "2px",
              }}
            >
              <StyledTypeBox>{group.type}</StyledTypeBox>
              <StyledSubtitle
                sx={{
                  color: isDark ? "#ffffff" : "#8c8c8c",
                  fontWeight: "600",
                }}
              >
                {group.now}
              </StyledSubtitle>
            </ListItemTextChild>
          }
          secondaryTypographyProps={{
            sx: { display: "flex", alignItems: "center", color: "#ccc" },
          }}
        />
        {headState?.open ? <ExpandLessRounded /> : <ExpandMoreRounded />}
      </ListItemButton>
    );
  }

  if (type === 1 && !group.hidden) {
    return (
      <ProxyHead
        sx={{ pl: 2, pr: 3, mt: indent ? 1 : 0.5, mb: 1 }}
        groupName={group.name}
        headState={headState!}
        onLocation={() => onLocation(group)}
        onCheckDelay={() => onCheckAll(group.name)}
        onHeadState={(p) => onHeadState(group.name, p)}
      />
    );
  }

  if (type === 2 && !group.hidden) {
    return (
      <ProxyItem
        groupName={group.name}
        proxy={proxy!}
        selected={group.now === proxy?.name}
        showType={headState?.showType}
        sx={{ py: 0, pl: 2 }}
        onClick={() => onChangeProxy(group, proxy!)}
      />
    );
  }

  if (type === 3 && !group.hidden) {
    return (
      <Box
        sx={{
          py: 2,
          pl: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <InboxRounded sx={{ fontSize: "2.5em", color: "inherit" }} />
        <Typography sx={{ color: "inherit" }}>No Proxies</Typography>
      </Box>
    );
  }

  if (type === 4 && !group.hidden) {
    return (
      <Box
        sx={{
          height: 56,
          display: "grid",
          gap: 1,
          pl: 2,
          pr: 2,
          pb: 1,
          gridTemplateColumns: `repeat(${item.col! || 2}, 1fr)`,
        }}
      >
        {proxyCol?.map((proxy) => (
          <ProxyItemMini
            key={item.key + proxy.name}
            groupName={group.name}
            proxy={proxy!}
            selected={group.now === proxy.name}
            showType={headState?.showType}
            onClick={() => onChangeProxy(group, proxy!)}
          />
        ))}
      </Box>
    );
  }

  return null;
};

const StyledPrimary = styled("span")`
  font-size: 14px;
  font-weight: 700;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
const StyledSubtitle = styled("span")`
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ListItemTextChild = styled("span")`
  display: block;
`;

const StyledTypeBox = styled(ListItemTextChild)(({ theme }) => ({
  display: "inline-block",
  border: "1px solid #ccc",
  borderColor: alpha(theme.palette.primary.main, 0.5),
  color: alpha(theme.palette.primary.main, 0.8),
  borderRadius: 4,
  fontSize: 10,
  padding: "0 4px",
  lineHeight: 1.5,
  marginRight: "8px",
}));

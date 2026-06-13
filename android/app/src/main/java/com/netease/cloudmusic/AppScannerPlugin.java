package com.netease.cloudmusic;

import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.drawable.Drawable;
import android.net.Uri;
import android.util.Base64;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@CapacitorPlugin(name = "AppScanner")
public class AppScannerPlugin extends Plugin {

    /**
     * Input:  { packages: string[] }  (optional)
     * Output: { installed: string[] } — subset of the given packages that are installed.
     *         If no list is given, returns every installed package on the device.
     */
    @PluginMethod
    public void getInstalled(PluginCall call) {
        PackageManager pm = getContext().getPackageManager();
        JSArray result = new JSArray();

        JSArray requested = call.getArray("packages", null);
        if (requested != null) {
            for (int i = 0; i < requested.length(); i++) {
                String pkg = requested.optString(i, null);
                if (pkg == null || pkg.isEmpty()) continue;
                if (isInstalled(pm, pkg)) result.put(pkg);
            }
        } else {
            List<android.content.pm.ApplicationInfo> apps =
                    pm.getInstalledApplications(0);
            for (android.content.pm.ApplicationInfo app : apps) {
                result.put(app.packageName);
            }
        }

        JSObject ret = new JSObject();
        ret.put("installed", result);
        call.resolve(ret);
    }

    /**
     * Input:  { uri: "scheme://host/path" }  or  { scheme, host?, path? }
     * Output: { resolves: boolean, packages: string[] } — apps with a BROWSABLE
     *         activity that handles this URI (i.e. the deep link will work).
     */
    @PluginMethod
    public void resolveScheme(PluginCall call) {
        Uri uri = buildUri(call);
        if (uri == null) {
            call.reject("Provide 'uri' or 'scheme'");
            return;
        }

        Intent intent = new Intent(Intent.ACTION_VIEW, uri);
        intent.addCategory(Intent.CATEGORY_BROWSABLE);

        PackageManager pm = getContext().getPackageManager();
        List<ResolveInfo> matches = pm.queryIntentActivities(intent, 0);

        JSArray packages = new JSArray();
        for (ResolveInfo ri : matches) {
            if (ri.activityInfo != null) packages.put(ri.activityInfo.packageName);
        }

        JSObject ret = new JSObject();
        ret.put("resolves", !matches.isEmpty());
        ret.put("packages", packages);
        call.resolve(ret);
    }

    /**
     * Input: { uri: "scheme://host/path" } or { scheme, host?, path? }
     * Launches the deep link as a BROWSABLE VIEW intent.
     */
    @PluginMethod
    public void openUri(PluginCall call) {
        Uri uri = buildUri(call);
        if (uri == null) {
            call.reject("Provide 'uri' or 'scheme'");
            return;
        }
        Intent intent = new Intent(Intent.ACTION_VIEW, uri);
        intent.addCategory(Intent.CATEGORY_BROWSABLE);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        try {
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("No app handles this URI", e);
        }
    }

    /**
     * Input: { package: "com.example.app" }
     * Launches the app's default launcher activity.
     */
    @PluginMethod
    public void launchPackage(PluginCall call) {
        String pkg = call.getString("package");
        if (pkg == null || pkg.isEmpty()) {
            call.reject("Provide 'package'");
            return;
        }
        PackageManager pm = getContext().getPackageManager();
        Intent intent = pm.getLaunchIntentForPackage(pkg);
        if (intent == null) {
            call.reject("App not installed or has no launcher activity");
            return;
        }
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        try {
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Failed to launch app", e);
        }
    }

    /**
     * Output: { apps: [{ package, label, icon }] } — every launchable app on the
     * device (icon is a base64 PNG data URI). Excludes this launcher itself.
     */
    @PluginMethod
    public void getLaunchableApps(PluginCall call) {
        PackageManager pm = getContext().getPackageManager();
        Intent intent = new Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_LAUNCHER);
        List<ResolveInfo> resolved = pm.queryIntentActivities(intent, 0);

        String self = getContext().getPackageName();
        Set<String> seen = new HashSet<>();
        JSArray apps = new JSArray();

        for (ResolveInfo ri : resolved) {
            if (ri.activityInfo == null) continue;
            String pkg = ri.activityInfo.packageName;
            if (pkg.equals(self) || !seen.add(pkg)) continue;

            JSObject app = new JSObject();
            app.put("package", pkg);
            app.put("label", ri.loadLabel(pm).toString());
            try {
                app.put("icon", drawableToDataUri(ri.loadIcon(pm)));
            } catch (Exception e) {
                app.put("icon", "");
            }
            apps.put(app);
        }

        JSObject ret = new JSObject();
        ret.put("apps", apps);
        call.resolve(ret);
    }

    private String drawableToDataUri(Drawable drawable) {
        int size = 96;
        Bitmap bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(bitmap);
        drawable.setBounds(0, 0, size, size);
        drawable.draw(canvas);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        bitmap.compress(Bitmap.CompressFormat.PNG, 100, out);
        bitmap.recycle();
        return "data:image/png;base64," + Base64.encodeToString(out.toByteArray(), Base64.NO_WRAP);
    }

    private boolean isInstalled(PackageManager pm, String pkg) {
        try {
            pm.getPackageInfo(pkg, 0);
            return true;
        } catch (PackageManager.NameNotFoundException e) {
            return false;
        }
    }

    private Uri buildUri(PluginCall call) {
        String uriStr = call.getString("uri");
        if (uriStr != null && !uriStr.isEmpty()) {
            return Uri.parse(uriStr);
        }
        String scheme = call.getString("scheme");
        if (scheme == null || scheme.isEmpty()) return null;
        String host = call.getString("host", "");
        String path = call.getString("path", "");
        StringBuilder sb = new StringBuilder(scheme).append("://");
        if (host != null) sb.append(host);
        if (path != null && !path.isEmpty()) {
            if (!path.startsWith("/")) sb.append("/");
            sb.append(path);
        }
        return Uri.parse(sb.toString());
    }
}

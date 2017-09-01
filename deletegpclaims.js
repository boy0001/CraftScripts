importPackage(Packages.org.bukkit);
importPackage(Packages.com.sk89q.worldedit);
importPackage(Packages.com.sk89q.worldedit.blocks);
importPackage(Packages.com.sk89q.worldedit.patterns);
importPackage(Packages.com.sk89q.worldedit.vector);
importPackage(Packages.com.sk89q.worldedit.regions);
importPackage(Packages.com.sk89q.worldedit.regions.region);
importPackage(Packages.com.sk89q.worldedit.tools);
importPackage(Packages.com.sk89q.worldedit.tools.brushes);
importPackage(Packages.com.sk89q.worldedit.world.biome);
importPackage(Packages.com.sk89q.worldedit.command.tool);
importPackage(Packages.com.sk89q.worldedit.command.tool.brush);
importPackage(Packages.com.sk89q.worldedit.function.operation);
importPackage(Packages.com.sk89q.worldedit.function.pattern);
importPackage(Packages.com.sk89q.worldedit.extension.platform.permission);
importPackage(Packages.com.boydti.fawe.util);
importPackage(Packages.me.ryanhamshire.GriefPrevention);

player.print(TaskManager.IMP);
TaskManager.IMP.task(new java.lang.Runnable(
{ 
    run: function () { 
        var world = context.getSession().getSelectionWorld();
        var region = context.getSession().getRegion();
        var claims = new java.util.ArrayList(GriefPrevention.instance.dataStore.getClaims());
        
        var bukkitWorld = Bukkit.getWorld(region.getWorld().getName());
        
        var min = region.getMinimumPoint();
        var max = region.getMaximumPoint();
        
        for (var i = 0; i < claims.size(); i++) {
            var claim = claims.get(i);
            var pos1 = claim.getLesserBoundaryCorner();
            var pos2 = claim.getGreaterBoundaryCorner();
            
            if (!pos1.getWorld().equals(bukkitWorld)) continue;
            if (pos1.getBlockX() >= min.getBlockX() && pos1.getBlockZ() >= min.getBlockZ() && pos2.getBlockX() <= max.getBlockX() && pos2.getBlockZ() <= max.getBlockZ()) {
                player.print("Deleting " + claim);
                GriefPrevention.instance.dataStore.deleteClaim(claim);
            }
        }
        player.print("Done!");
    } 
}));
